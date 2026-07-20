/* eslint-disable react-hooks/rules-of-hooks */
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { array, object, string, InferType } from "yup";
import { useEffect } from "react";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useMutationForo } from "./mutation-foro";
import { ForumPayload } from "./cosntants";
import { useAlertStore } from "@/app/components/store/useAlertStore";

const schema = object({
  title: string().required("El título es obligatorio"),
  content: string().required("El contenido es obligatorio"),
  nameUnit: string().required("La unidad es obligatoria"),
  conjuntoId: string().required("El conjunto es obligatorio"),
  createdBy: string().required("El usuario es obligatorio"),

  polls: array()
    .of(
      object({
        question: string().required("La pregunta es obligatoria"),
        options: array()
          .of(
            object({
              option: string().required("La opción es obligatoria"),
            }),
          )
          .min(1, "Debe haber al menos una opción")
          .required(),
      }),
    )
    .min(1, "Debe haber al menos una encuesta")
    .required(),
});

export type ForumFormValues = InferType<typeof schema>;

export function useFormForo() {
  const mutation = useMutationForo();
  const showAlert = useAlertStore((state) => state.showAlert);

  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const userunit = useConjuntoStore((state) => state.conjuntoName);

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
      nameUnit: String(userunit ?? ""),
      conjuntoId: String(idConjunto ?? ""),
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
    }),
  );

  const { setValue, formState } = methods;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }

    if (userunit) {
      setValue("nameUnit", String(userunit));
    }
  }, [idConjunto, userunit, setValue]);

  const onSubmit = methods.handleSubmit(
    async (dataform) => {
      const payload: ForumPayload = {
        ...dataform,
        polls:
          dataform.polls?.map((poll) => ({
            question: poll.question ?? "",
            options:
              poll.options?.map((opt) => ({
                option: opt.option ?? "",
              })) ?? [],
          })) ?? [],
      };

      await mutation.mutateAsync(payload);
    },
    (validationErrors) => {
      /* conjuntoId y nameUnit no tienen input visible: sin esto el submit
         falla en silencio cuando el store no los tiene cargados. */
      const firstMessage = Object.values(validationErrors)
        .map((error) => (error as { message?: string })?.message)
        .find(Boolean);

      showAlert(firstMessage ?? "Revisa los campos del formulario", "error");
    },
  );

  return {
    ...methods,
    pollsFields,
    appendPoll,
    removePoll,
    optionFieldArrays,
    setValue,
    formState,
    isSubmitting: formState.isSubmitting,
    errors: formState.errors,
    handleSubmit: onSubmit,
  };
}
