"use client";

import { object, string, InferType } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useResolveAllMutation } from "./use-resolve-all-mutation";
import { AllPqrStatus } from "../services/response/AllPqrResponse";
import { useStaffOptions } from "./use-staff-options";

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
  // Opcional: no toda petición necesita que alguien del personal la ejecute.
  assignedToId: string().optional(),
});

type FormValues = InferType<typeof schema>;

export function useResolveAllForm(id: string, onClose: () => void) {
  const mutation = useResolveAllMutation();
  const { staffOptions, isLoadingStaff } = useStaffOptions();

  const { register, handleSubmit, formState, reset, setValue, watch } =
    useFormHook<FormValues>({
      mode: "all",
      resolver: yupResolver(schema),
      defaultValues: {
        status: "pendiente",
        resolution: "",
        assignedToId: "",
      },
    });

  const { errors } = formState;

  const onSubmit = handleSubmit(async (data) => {
    await mutation.mutateAsync({
      id,
      data: {
        status: data.status as AllPqrStatus,
        resolution: data.resolution,
        // El backend rechaza un uuid vacío: sin encargado no se manda el campo.
        ...(data.assignedToId ? { assignedToId: data.assignedToId } : {}),
      },
    });
    reset();
    onClose();
  });

  return {
    register,
    setValue,
    watch,
    handleSubmit: onSubmit,
    errors,
    isPending: mutation.isPending,
    staffOptions,
    isLoadingStaff,
  };
}
