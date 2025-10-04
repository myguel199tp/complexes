/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number } from "yup";
import { useMutationPayUser } from "../use-pay-mutation";
import { CreateAdminFeeRequest } from "../../services/request/adminFee";

// ✅ Schema para validar
const schema = object({
  relationId: string().required("El ID de la relación es obligatorio"),
  amount: number()
    .typeError("El monto debe ser un número")
    .required("El monto es obligatorio"),
  dueDate: string().required("La fecha de vencimiento es obligatoria"),
  paidAt: string().required("La fecha de pago es obligatoria"), // si puede venir vacío, cámbialo a .nullable()
  status: string()
    .oneOf(["pending", "paid", "late"], "Estado inválido")
    .required("El estado es obligatorio"),
});

export function useFormPayUser(relationId: string) {
  const mutation = useMutationPayUser();

  const methods = useForm<CreateAdminFeeRequest>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      relationId,
      amount: 0,
      dueDate: "",
      paidAt: "",
      status: "pending",
    },
  });

  const { handleSubmit, formState, reset, setValue } = methods;

  // 🔹 Si el relationId cambia, actualizamos el formulario
  useEffect(() => {
    if (relationId) {
      setValue("relationId", relationId);
      // O si quieres resetear todo el formulario con valores iniciales:
      // reset({ relationId, amount: 0, dueDate: "", paidAt: "", status: "pending" });
    }
  }, [relationId, setValue, reset]);

  const onSubmit = handleSubmit(async (data) => {
    await mutation.mutateAsync(data);
  });

  return {
    ...methods,
    onSubmit, // para no sobrescribir handleSubmit original
    isSubmitting: formState.isSubmitting,
    errors: formState.errors,
  };
}
