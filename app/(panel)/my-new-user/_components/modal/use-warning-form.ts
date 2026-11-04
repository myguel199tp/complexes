"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InferType, object, string } from "yup";

import { useCreateWarningMutation } from "./use-warnings";

const schema = object({
  relationId: string().required("El residente es obligatorio"),

  title: string().required("El título es obligatorio"),

  reason: string().required("El motivo es obligatorio"),

  incidentDate: string().optional(),

  correctionDeadline: string().optional(),

  evidenceUrl: string().optional(),
});

export type WarningFormValues = InferType<typeof schema>;

const EMPTY: WarningFormValues = {
  relationId: "",
  title: "",
  reason: "",
  incidentDate: "",
  correctionDeadline: "",
  evidenceUrl: "",
};

export function useWarningForm(onSuccess?: () => void) {
  const createMutation = useCreateWarningMutation();

  const methods = useForm<WarningFormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: EMPTY,
  });

  const { handleSubmit, formState, reset, getValues } = methods;

  const onSubmit = handleSubmit(async (data: WarningFormValues) => {
    await createMutation.mutateAsync({
      relationId: data.relationId,
      title: data.title,
      reason: data.reason,
      incidentDate: data.incidentDate || undefined,
      correctionDeadline: data.correctionDeadline || undefined,
      evidenceUrl: data.evidenceUrl || undefined,
    });

    // Se conserva la unidad: el modal sigue abierto sobre el mismo residente.
    reset({ ...EMPTY, relationId: getValues("relationId") });

    onSuccess?.();
  });

  return {
    ...methods,
    isSubmitting: formState.isSubmitting || createMutation.isPending,
    handleSubmit: onSubmit,
  };
}
