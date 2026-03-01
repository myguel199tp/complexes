/* eslint-disable react-hooks/rules-of-hooks */
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { mixed, object, ObjectSchema, string } from "yup";
import { useEffect } from "react";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useCreateMaintenance } from "./mutation-maintenance";
import {
  CreateMaintenanceRequest,
  MaintenanceFrequency,
} from "../../services/request/crateMaintenaceRequest";

const schema: ObjectSchema<CreateMaintenanceRequest> = object({
  conjuntoId: string().optional(),

  commonAreaId: string().required("La zona común es obligatoria"),

  providerId: string().required("El proveedor es obligatorio"),

  lastMaintenanceDate: string().required(
    "La fecha de mantenimiento es obligatoria",
  ),

  frequency: mixed<MaintenanceFrequency>()
    .oneOf(Object.values(MaintenanceFrequency))
    .required("La frecuencia es obligatoria"),

  notes: string().optional(),
});

export function useFormMaintenance() {
  const createMutation = useCreateMaintenance();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  const methods = useForm({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      conjuntoId: idConjunto || "",
      notes: "",
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", idConjunto, {
        shouldValidate: true,
      });
    }
  }, [idConjunto, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    await createMutation.mutateAsync(data as CreateMaintenanceRequest);
  });

  return {
    ...methods,
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,
    handleSubmit: onSubmit,
    register,
  };
}
