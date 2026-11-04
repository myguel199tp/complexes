"use client";

/* eslint-disable react-hooks/rules-of-hooks */

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InferType, number, object, string } from "yup";

import { useResidentFineMutation } from "./useCreateMulta";

const schema = object({
  relationId: string().required("El residente es obligatorio"),

  title: string().required("El título es obligatorio"),

  reason: string().required("La razón es obligatoria"),

  amount: number()
    .typeError("El monto debe ser numérico")
    .required("El monto es obligatorio")
    .min(1, "El monto debe ser mayor a 0"),

  dueDate: string().required("La fecha límite es obligatoria"),

  incidentDate: string().optional(),

  evidenceUrl: string().optional(),

  warningId: string().optional(),
});

export type FormValues = InferType<typeof schema>;

const EMPTY: FormValues = {
  relationId: "",
  title: "",
  reason: "",
  amount: 0,
  dueDate: "",
  incidentDate: "",
  evidenceUrl: "",
  warningId: "",
};

export function useFormResidentFine(onSuccess?: () => void) {
  const createMutation = useResidentFineMutation();

  const methods = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: EMPTY,
  });

  const { handleSubmit, formState, reset, getValues } = methods;

  const onSubmit = handleSubmit(async (data: FormValues) => {
    await createMutation.mutateAsync({
      relationId: data.relationId,
      title: data.title,
      reason: data.reason,
      amount: Number(data.amount),
      dueDate: data.dueDate,
      incidentDate: data.incidentDate || undefined,
      evidenceUrl: data.evidenceUrl || undefined,
      warningId: data.warningId || undefined,
    });

    // Limpia el formulario pero conserva la unidad: el modal sigue sobre el
    // mismo residente, y sin ella la siguiente multa no pasaba la validación.
    reset({ ...EMPTY, relationId: getValues("relationId") });

    // cerrar modal
    if (onSuccess) {
      onSuccess();
    }
  });

  return {
    ...methods,
    errors: formState.errors,
    isSubmitting: formState.isSubmitting || createMutation.isPending,
    handleSubmit: onSubmit,
  };
}
