/* eslint-disable react-hooks/rules-of-hooks */
import { Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number, ObjectSchema } from "yup";
import { useMutationFeePayUser } from "../use-fee-pay-mutation";
import { useUiStore } from "./store/new-store";
import { CreateAdminPayFeeRequest } from "../../services/request/adminFeePayRequest";

const schema: ObjectSchema<CreateAdminPayFeeRequest> = object({
  adminFeeId: string().required(),
  month: number().required(),
  year: string().required(),
  amount: string().required(),
  status: string().oneOf(["pending", "paid", "late"]).required(),
}).required();

export function useFormPayUser() {
  const mutation = useMutationFeePayUser();
  const { textValue } = useUiStore();

  const methods = useForm<CreateAdminPayFeeRequest>({
    mode: "onChange",
    resolver: yupResolver(schema) as Resolver<CreateAdminPayFeeRequest>,
    defaultValues: {
      adminFeeId: textValue,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear().toString(),
      amount: "",
      status: "pending",
    },
  });

  const { handleSubmit, formState, reset } = methods;

  const onSubmit = handleSubmit(async (data) => {
    await mutation.mutateAsync(data);
    reset();
  });

  return {
    ...methods,
    onSubmit,
    isSubmitting: formState.isSubmitting,
    errors: formState.errors,
  };
}
