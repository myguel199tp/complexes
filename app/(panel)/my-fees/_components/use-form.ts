import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number, boolean, array, mixed, InferType } from "yup";
import { useEffect } from "react";

import { useSearchParams } from "next/navigation";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAdminFeePaymentMutation } from "./use-mutation-fees";
import { useFeePaymentsQuery } from "./use-fee-payments-query";
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

  /**
   * Días de mora desde los que la cartera sugiere trasladar a cobro jurídico.
   *
   * Solo marca la unidad como candidata: el traslado sigue siendo manual. El
   * mínimo de 30 evita señalar a quien apenas se atrasó unos días; el máximo de
   * 1095 es el término de prescripción, pasado el cual sugerirlo ya no sirve.
   */
  legalThresholdDays: number()
    .transform((value, original) => (original === "" ? undefined : value))
    .min(30, "El corte mínimo es de 30 días")
    .max(1095, "Máximo 1095 días (tres años)")
    .optional(),

  /**
   * Cuántas cuotas generar en total.
   *
   * Estaba en el schema pero no tenía campo en el formulario, así que siempre
   * llegaba vacío: el backend caía al default de 12 para la cuota de
   * administración y rechazaba la generación —"Debes definir specificMonths,
   * o intervalMonths + monthsToGenerate"— para todos los demás tipos.
   */
  monthsToGenerate: number()
    .transform((value, original) => (original === "" ? undefined : value))
    .min(1, "Debe generar al menos una cuota")
    .max(60, "Máximo 60 cuotas")
    .when("feeType", {
      is: (value: FeeType) =>
        value === FeeType.CUOTA_EXTRAORDINARIAS ||
        value === FeeType.PAGO_DE_PARQUEADERO,
      then: (s) => s.optional(),
      otherwise: (s) => s.required("Indica cuántas cuotas generar"),
    }),

  /** Se deriva de la frecuencia; no se pide aparte. */
  intervalMonths: number().optional(),

  /**
   * Cuentas a las que el residente debe consignar. El backend ya recibía el
   * campo, pero el formulario nunca lo enviaba.
   */
  bankAccountIds: array().of(string().required()).optional(),

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

/**
 * Meses entre una cuota y la siguiente según la frecuencia elegida.
 *
 * El select de "Frecuencia" solo guardaba `recommendedSchedule`, un texto que
 * la generación de cuotas no lee: aunque el administrador eligiera
 * "Trimestral", el backend generaba mes a mes porque `intervalMonths` llegaba
 * vacío y caía al valor por defecto de 1.
 */
const MONTHS_BY_SCHEDULE: Record<string, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  BIANNUAL: 6,
  YEARLY: 12,
};

export function useFormProvider() {
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  /**
   * `?id=` en la URL abre el formulario sobre una configuración existente. Sin
   * esto la única forma de "editar" era volver a guardar, que insertaba una
   * fila nueva.
   */
  const searchParams = useSearchParams();
  const configId = searchParams.get("id") ?? undefined;

  const createMutation = useAdminFeePaymentMutation(configId);

  const { data: configs = [] } = useFeePaymentsQuery(idConjunto ?? "");

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

  const { handleSubmit, setValue, watch, reset } = methods;

  const feeType = watch("feeType");

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
  }, [idConjunto, setValue]);

  // Precarga la configuración que se está editando.
  useEffect(() => {
    if (!configId || !idConjunto) return;

    const config = configs.find((item) => item.id === configId);
    if (!config) return;

    reset({
      conjuntoId: String(idConjunto),
      // El backend devuelve la fecha completa y el input espera `YYYY-MM-DD`.
      lastPaymentDate: config.lastPaymentDate?.slice(0, 10),
      amount: config.amount,
      currency: config.currency ?? "COP",
      recommendedSchedule: config.recommendedSchedule,
      digitalPaymentEnabled: config.digitalPaymentEnabled ?? false,
      digitalPaymentUrl: config.digitalPaymentUrl,
      showMessageDaysBefore: config.showMessageDaysBefore,
      moraRatePercent: config.moraRatePercent,
      legalThresholdDays: config.legalThresholdDays,
      monthsToGenerate: config.monthsToGenerate,
      intervalMonths: config.intervalMonths,
      feeType: config.feeType,
      specificMonths: config.specificMonths ?? [],
      parkingRatePerHour: config.parkingRatePerHour,
      bankAccountIds: config.bankAccounts?.map((account) => account.id) ?? [],
    });
  }, [configId, configs, idConjunto, reset]);

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
    const isExtraordinary = data.feeType === FeeType.CUOTA_EXTRAORDINARIAS;

    const payload = {
      ...data,
      monthsToGenerate:
        isExtraordinary || isParking ? undefined : data.monthsToGenerate,

      /*
        Las cuotas extraordinarias van por meses explícitos y el parqueadero se
        cobra por hora: en ninguno de los dos casos hay periodicidad que derivar.
      */
      intervalMonths:
        isExtraordinary || isParking
          ? undefined
          : MONTHS_BY_SCHEDULE[data.recommendedSchedule ?? ""] ?? 1,

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
