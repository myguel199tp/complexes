"use client";

import { object, string, InferType } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useResolveAllMutation } from "./use-resolve-all-mutation";
import { AllPqrStatus } from "../services/response/AllPqrResponse";

const schema = object({
  status: string()
    .required("El estado es requerido")
    .oneOf(
      ["pendiente", "en_proceso", "aceptada", "rechazada"],
      "Estado inválido",
    ),
  resolution: string()
    .required("La resolución es requerida")
    .min(10, "Mínimo 10 caracteres"),
});

type FormValues = InferType<typeof schema>;

export function useResolveAllForm(id: string, onClose: () => void) {
  const mutation = useResolveAllMutation();

  const { register, handleSubmit, formState, reset } =
    useFormHook<FormValues>({
      mode: "all",
      resolver: yupResolver(schema),
      defaultValues: {
        status: "pendiente",
        resolution: "",
      },
    });

  const { errors } = formState;

  const onSubmit = handleSubmit(async (data) => {
    await mutation.mutateAsync({
      id,
      data: {
        status: data.status as AllPqrStatus,
        resolution: data.resolution,
      },
    });
    reset();
    onClose();
  });

  return {
    register,
    handleSubmit: onSubmit,
    errors,
    isPending: mutation.isPending,
  };
}
