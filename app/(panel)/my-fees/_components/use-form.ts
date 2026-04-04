/* eslint-disable react-hooks/rules-of-hooks */
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number, boolean, array, mixed, InferType } from "yup";
import { useEffect } from "react";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAdminFeePaymentMutation } from "./use-mutation-fees";
import { FeeType } from "../services/admin-fee-payment";

const schema = object({
  conjuntoId: string().required("El conjunto es requerido"),

  lastPaymentDate: string().optional(),

  amount: number().typeError("Debe ser un número").optional(),

  currency: string().optional(),

  paymentPlaces: array().of(string()).optional(),

  recommendedSchedule: string().optional(),

  digitalPaymentEnabled: boolean().optional(),

  digitalPaymentUrl: string().optional(),

  showMessageDaysBefore: number().typeError("Debe ser un número").optional(),

  // ================= NUEVOS CAMPOS =================

  monthsToGenerate: number().typeError("Debe ser un número").optional(),

  feeType: mixed<FeeType>()
    .oneOf(Object.values(FeeType), "Tipo de cuota inválido")
    .optional(),

  specificMonths: array()
    .of(
      number()
        .typeError("Debe ser un número")
        .min(1, "Mes mínimo 1")
        .max(12, "Mes máximo 12"),
    )
    .optional(),
});

export type FormValues = InferType<typeof schema>;

export function useFormProvider() {
  const createMutation = useAdminFeePaymentMutation();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  const methods = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      conjuntoId: idConjunto ?? "",
      lastPaymentDate: "",
      amount: undefined,
      currency: "COP",
      paymentPlaces: [],
      recommendedSchedule: "",
      digitalPaymentEnabled: false,
      digitalPaymentUrl: "",
      showMessageDaysBefore: undefined,

      // NUEVOS
      monthsToGenerate: undefined,
      feeType: undefined,
      specificMonths: [],
    },
  });

  const { handleSubmit, setValue, formState, control } = methods;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
  }, [idConjunto, setValue]);

  const onSubmit = handleSubmit(async (data: FormValues) => {
    await createMutation.mutateAsync(data);
  });

  return {
    ...methods,
    control,
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,
    handleSubmit: onSubmit,
  };
}
