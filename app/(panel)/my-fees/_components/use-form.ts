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

  amount: number()
    .typeError("Debe ser un número")
    .when("feeType", {
      is: FeeType.PAGO_DE_PARQUEADERO,
      then: (s) => s.optional(),
      otherwise: (s) => s.required(),
    }),

  currency: string().optional(),

  recommendedSchedule: string().optional(),

  digitalPaymentEnabled: boolean().optional(),

  digitalPaymentUrl: string().optional(),

  showMessageDaysBefore: number()
    .transform((value, original) => (original === "" ? undefined : value))
    .min(0)
    .max(30, "Máximo 30 días de anticipación")
    .optional(),

  /**
   * Interés de mora mensual. Se acota a 10% para que un error de digitación no
   * le cargue una mora desproporcionada a toda la copropiedad; dejarlo vacío
   * significa que el conjunto no cobra mora.
   */
  moraRatePercent: number()
    .transform((value, original) => (original === "" ? undefined : value))
    .min(0)
    .max(10, "El interés de mora no puede superar el 10%")
    .optional(),

  monthsToGenerate: number().optional(),

  feeType: mixed<FeeType>().oneOf(Object.values(FeeType)).required(),

  specificMonths: array().of(number().min(1).max(12)).optional(),

  parkingRatePerHour: number()
    .typeError("Debe ser un número")
    .when("feeType", {
      is: FeeType.PAGO_DE_PARQUEADERO,
      then: (s) => s.required("Ingresa el valor por hora").min(1),
      otherwise: (s) => s.optional(),
    }),
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

    // Parqueadero se cobra por hora: limpiar los campos de cuota mensual.
    if (feeType === FeeType.PAGO_DE_PARQUEADERO) {
      setValue("amount", undefined as unknown as number);
      setValue("monthsToGenerate", undefined);
      setValue("specificMonths", []);
    } else {
      // Al salir de parqueadero, limpiar la tarifa por hora.
      setValue("parkingRatePerHour", undefined);
    }
  }, [feeType, setValue]);

  const onSubmit = handleSubmit(async (data: FormValues) => {
    const isParking = data.feeType === FeeType.PAGO_DE_PARQUEADERO;

    const payload = {
      ...data,
      monthsToGenerate:
        data.feeType === FeeType.CUOTA_EXTRAORDINARIAS || isParking
          ? undefined
          : data.monthsToGenerate,
      // El valor por hora solo aplica al pago de parqueadero.
      parkingRatePerHour: isParking ? data.parkingRatePerHour : undefined,
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
