import { useForm, useFieldArray, useWatch, FieldErrors } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { array, InferType, object, string, boolean, mixed } from "yup";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useEffect } from "react";
import { useMutationAssembly } from "./mutationAsembly";
import {
  AssemblyMode,
  AssemblyType,
  CreateAssemblyRequest,
} from "../services/request/assemblyRequest";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";

const payload = getTokenPayload();

const schema = object({
  title: string().required("El título es obligatorio"),
  typeAssembly: mixed<AssemblyType>()
    .oneOf(Object.values(AssemblyType))
    .required("El tipo de asamblea es obligatorio"),
  mode: mixed<AssemblyMode>()
    .oneOf(Object.values(AssemblyMode))
    .required("El modo es obligatorio"),
  startDate: string().required("La fecha de inicio es obligatoria"),
  endDate: string().optional(),
  isVirtual: boolean().optional(),
  link: string().optional(),
  address: string().optional(),
  conjuntoId: string(),
  description: string().optional(),
  createdBy: string().optional(),
  attendees: array(string()).optional(),
  absents: array(string()).optional(),
  canVote: array(string()).optional(),
  cannotVote: array(string()).optional(),
  polls: array(
    object({
      question: string().required("La pregunta es obligatoria"),
      options: array(
        object({
          option: string().required("La opción es obligatoria"),
        })
      ).min(1, "Debe haber al menos una opción"),
    })
  ).optional(),
});

export type ForumFormValues = InferType<typeof schema>;

export function useFormForo() {
  const mutation = useMutationAssembly();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  const methods = useForm<ForumFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      typeAssembly: undefined,
      mode: undefined,
      isVirtual: false,
      createdBy: String(storedUserId),
      polls: [{ question: "", options: [{ option: "" }] }],
      conjuntoId: String(idConjunto ?? ""),
    },
  });

  const { control, setValue, formState, handleSubmit } = methods;

  const {
    fields: pollsFields,
    append: appendPoll,
    remove: removePoll,
  } = useFieldArray({
    control,
    name: "polls",
  });

  const pollsWatch = useWatch({ control, name: "polls" });

  useEffect(() => {
    if (idConjunto) setValue("conjuntoId", String(idConjunto));
  }, [idConjunto, setValue]);

  const onSubmit = handleSubmit(async (dataform: ForumFormValues) => {
    console.log("Form data:", dataform);
    try {
      const payload: CreateAssemblyRequest = {
        title: dataform.title,
        typeAssembly: dataform.typeAssembly!,
        mode: dataform.mode!,
        startDate: dataform.startDate,
        endDate: dataform.endDate || undefined,
        isVirtual: dataform.isVirtual ?? undefined,
        link: dataform.link || undefined,
        address: dataform.address || undefined,
        conjuntoId: dataform.conjuntoId || undefined,
        description: dataform.description || undefined,
        createdBy: dataform.createdBy || undefined,
        polls: dataform.polls?.map((p) => ({
          question: p.question,
          options: p.options?.map((o) => ({ option: o.option })) || [],
        })),
      };

      await mutation.mutateAsync(payload);
    } catch (error) {
      console.error("❌ Error al enviar asamblea:", error);
    }
  });

  return {
    ...methods,
    pollsFields,
    appendPoll,
    removePoll,
    pollsWatch,
    isSubmitting: formState.isSubmitting,
    errors: formState.errors as FieldErrors<ForumFormValues>,
    onSubmit,
    control,
  };
}
