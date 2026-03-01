/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number, ObjectSchema } from "yup";

import { useMutationFeePayUser } from "../use-fee-pay-mutation";
import { CreateAdminPayFeeRequest } from "../../services/request/adminFeePayRequest";
import { useUiStore } from "./store/new-store";

const schema: ObjectSchema<CreateAdminPayFeeRequest> = object({
  relationId: string().required("RelationId es obligatorio"),
  adminFeeId: string().required("AdminFeeId es obligatorio"),
  month: number()
    .min(1, "El mes debe estar entre 1 y 12")
    .max(12, "El mes debe estar entre 1 y 12")
    .required("El mes es obligatorio"),
  year: string()
    .matches(/^\d{4}$/, "Debe ser un año válido")
    .required("El año es obligatorio"),
  amount: string()
    .matches(/^\d+(\.\d{1,2})?$/, "Debe ser un valor numérico válido")
    .required("El monto es obligatorio"),
  status: string()
    .oneOf(["pending", "paid", "late"])
    .required("El estado es obligatorio"),
}).required();

export function useFormPayMentUser(relationId: string) {
  const mutation = useMutationFeePayUser();
  const { textValue } = useUiStore();

  const methods = useForm<CreateAdminPayFeeRequest>({
    mode: "onChange",

    resolver: yupResolver(schema) as Resolver<CreateAdminPayFeeRequest>,

    defaultValues: {
      relationId,
      adminFeeId: textValue,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear().toString(),
      amount: "",
      status: "pending",
    },
  });

  const { handleSubmit, formState, reset, setValue } = methods;

  useEffect(() => {
    if (relationId) {
      setValue("relationId", relationId);
    }
  }, [relationId, setValue]);

  const onSubmit = handleSubmit(async (data: CreateAdminPayFeeRequest) => {
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
  };
}
