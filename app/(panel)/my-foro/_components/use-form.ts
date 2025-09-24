/* eslint-disable react-hooks/rules-of-hooks */
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationForo } from "./mutation-foro";
import { array, InferType, object, string } from "yup";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const schema = object({
  title: string().required("El título es obligatorio"),
  content: string().required("El contenido es obligatorio"),
  nameUnit: string().required("La unidad es obligatoria"),
  conjunto_id: string().required("El conjunto es obligatorio"),
  createdBy: string().required("El usuario es obligatorio"),
  polls: array()
    .of(
      object({
        question: string().required("La pregunta es obligatoria"),
        options: array()
          .of(
            object({
              option: string().required("La opción es obligatoria"),
            })
          )
          .min(1, "Debe haber al menos una opción")
          .required("Debe haber opciones"),
      })
    )
    .min(1, "Debe haber al menos una encuesta")
    .required("Debe haber encuestas"),
});

export type ForumFormValues = InferType<typeof schema>;

export function useFormForo() {
  const mutation = useMutationForo();
  const { data } = useEnsembleInfo();

  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const userunit = data?.[0]?.conjunto.name || "";

  const methods = useForm<ForumFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      createdBy: "",
      polls: [
        {
          question: "",
          options: [{ option: "" }],
        },
      ],
      nameUnit: userunit, // ✅ nunca será undefined
      conjunto_id: String(idConjunto ?? ""), // igual, asegúrate que sea string
    },
  });

  const {
    fields: pollsFields,
    append: appendPoll,
    remove: removePoll,
  } = useFieldArray({
    control: methods.control,
    name: "polls",
  });

  const optionFieldArrays = pollsFields.map((_, pollIndex) =>
    useFieldArray({
      control: methods.control,
      name: `polls.${pollIndex}.options` as const,
    })
  );

  const { handleSubmit, setValue, formState } = methods;

  const onSubmit = handleSubmit(async (dataform: ForumFormValues) => {
    await mutation.mutateAsync(dataform);
  });

  return {
    ...methods,
    pollsFields,
    appendPoll,
    removePoll,
    optionFieldArrays,
    setValue,
    formState,
    handleSubmit: onSubmit,
    isSubmitting: formState.isSubmitting,
    errors: formState.errors,
  };
}
