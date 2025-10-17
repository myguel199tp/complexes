/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationPayUser } from "../use-pay-mutation";
import { CreateAdminFeeRequest } from "../../services/request/adminFee";

import { object, string, number, mixed } from "yup";
import { FeeType } from "../../services/request/adminFee";

const schema = object({
  relationId: string().required("El ID de la relación es obligatorio"),
  amount: number()
    .typeError("El monto debe ser un número")
    .required("El monto es obligatorio"),
  dueDate: string().required("La fecha de vencimiento es obligatoria"),
  description: string().required("La descripción es obligatoria"),
  type: mixed<FeeType>()
    .oneOf(Object.values(FeeType), "Tipo inválido")
    .required("El tipo es obligatorio"),
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
      description: "",
      type: FeeType.CUOTA_DE_ADMINISTRACION,
    },
  });

  const { handleSubmit, formState, setValue } = methods;

  useEffect(() => {
    if (relationId) {
      setValue("relationId", relationId);
    }
  }, [relationId, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    await mutation.mutateAsync(data);
  });

  return {
    ...methods,
    onSubmit,
    isSubmitting: formState.isSubmitting,
    errors: formState.errors,
    setValue,
  };
}
