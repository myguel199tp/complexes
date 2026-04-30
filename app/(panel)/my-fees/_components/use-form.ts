import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number, boolean, array, mixed, InferType } from "yup";
import { useEffect } from "react";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAdminFeePaymentMutation } from "./use-mutation-fees";
import { FeeType } from "../services/admin-fee-payment";

const schema = object({
  conjuntoId: string().required(),

  lastPaymentDate: string().optional(),

  amount: number().typeError("Debe ser un número").required(),

  currency: string().optional(),

  recommendedSchedule: string().optional(),

  digitalPaymentEnabled: boolean().optional(),

  digitalPaymentUrl: string().optional(),

  showMessageDaysBefore: number().optional(),

  monthsToGenerate: number().optional(),

  feeType: mixed<FeeType | "OTHER">()
    .oneOf([...Object.values(FeeType), "OTHER"])
    .required(),
  customFeeType: string().when("feeType", {
    is: "OTHER",
    then: (schema) => schema.required("Debes especificar el tipo"),
    otherwise: (schema) => schema.optional(),
  }),

  specificMonths: array().of(number().min(1).max(12)).optional(),
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
      currency: "COP",
      digitalPaymentEnabled: false,
      specificMonths: [],
    },
  });

  const { handleSubmit, setValue, watch } = methods;

  const feeType = watch("feeType");

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
  }, [idConjunto, setValue]);

  // limpiar campos según tipo

  useEffect(() => {
    if (feeType === FeeType.CUOTA_EXTRAORDINARIAS) {
      setValue("monthsToGenerate", undefined);
    }

    if (feeType !== FeeType.CUOTA_EXTRAORDINARIAS) {
      setValue("specificMonths", []);
    }
  }, [feeType, setValue]);

  const onSubmit = handleSubmit(async (data: FormValues) => {
    const payload = {
      ...data,
      monthsToGenerate:
        data.feeType === FeeType.CUOTA_EXTRAORDINARIAS
          ? undefined
          : data.monthsToGenerate,
    };

    await createMutation.mutateAsync(payload);
  });

  return {
    ...methods,
    handleSubmit: onSubmit,
    errors: methods.formState.errors,
    isSubmitting: methods.formState.isSubmitting,
  };
}
