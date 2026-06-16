"use client";

import { object, string, InferType } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useResolveMutation } from "./use-resolve-mutation";
import { PqrStatus } from "../services/response/pqrResponse";

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

export function useResolveForm(id: string, onClose: () => void) {
  const mutation = useResolveMutation();

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
        status: data.status as PqrStatus,
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
