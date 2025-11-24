/* eslint-disable react-hooks/rules-of-hooks */
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number } from "yup";
import { useMutationFeePayUser } from "../use-fee-pay-mutation";
import { CreateAdminPayFeeRequest } from "../../services/request/adminFeePayRequest";
import { useUiStore } from "./store/new-store";
import { useEffect } from "react";

// ✅ Esquema de validación con Yup
const schema = object({
  relationId: string().required("El ID de la relación es obligatorio"),
  adminFeeId: string().required("El ID de la cuota es obligatorio"),
  month: number()
    .min(1, "El mes debe ser entre 1 y 12")
    .max(12, "El mes debe ser entre 1 y 12")
    .required("El mes es obligatorio"),
  year: string()
    .matches(/^\d{4}$/, "Debe ser un año válido (ej. 2025)")
    .required("El año es obligatorio"),
  amount: string()
    .matches(/^\d+(\.\d{1,2})?$/, "Debe ser un valor numérico válido")
    .required("El monto es obligatorio"),
  status: string()
    .oneOf(["pending", "paid", "late"], "Estado inválido")
    .required("El estado es obligatorio"),
});

export function useFormPayMentUser(relationId: string) {
  const mutation = useMutationFeePayUser();
  const { textValue } = useUiStore();

  const methods = useForm<CreateAdminPayFeeRequest>({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {
      relationId,
      adminFeeId: textValue,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear().toString(),
    },
  });

  const { handleSubmit, formState, reset, setValue } = methods;

  useEffect(() => {
    if (relationId) {
      setValue("relationId", relationId);
    }
  }, [relationId, setValue]);

  // ✅ Función de envío de datos
  const onSubmit = handleSubmit(async (data) => {
    try {
      await mutation.mutateAsync(data);
      reset();
    } catch (error) {
      console.error("Error al registrar el pago:", error);
    }
  });

  return {
    ...methods,
    onSubmit,
    isSubmitting: formState.isSubmitting,
    errors: formState.errors,
    setValue,
  };
}
