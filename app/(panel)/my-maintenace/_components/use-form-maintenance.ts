/* eslint-disable react-hooks/rules-of-hooks */
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, date } from "yup";
import { useEffect } from "react";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  useCreateMaintenance,
  useUpdateMaintenance,
} from "./mutation-maintenance";

const schema = object({
  conjuntoId: string().required("El conjunto es obligatorio"),
  commonAreaId: string().required("La zona común es obligatoria"),
  providerId: string().required("El proveedor es obligatorio"),
  lastMaintenanceDate: date().required("La fecha es obligatoria"),
  frequency: string().required("La frecuencia es obligatoria"),
  notes: string().nullable(),
});
export type MaintenanceFormValues = {
  conjuntoId: string;
  commonAreaId: string;
  providerId: string;
  lastMaintenanceDate: Date;
  frequency: string;
  notes?: string | null;
};

interface Props {
  maintenanceId?: string;
  defaultValues?: Partial<MaintenanceFormValues>;
}

export function useFormMaintenance({
  maintenanceId,
  defaultValues,
}: Props = {}) {
  const createMutation = useCreateMaintenance();
  const updateMutation = useUpdateMaintenance();

  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const methods = useForm<MaintenanceFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      conjuntoId: String(conjuntoId ?? ""),
      commonAreaId: "",
      providerId: "",
      frequency: "",
      notes: "",
      ...defaultValues,
    },
  });

  const { setValue, formState } = methods;

  useEffect(() => {
    if (conjuntoId) {
      setValue("conjuntoId", String(conjuntoId));
    }
  }, [conjuntoId, setValue]);

  const onSubmit = methods.handleSubmit(async (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (maintenanceId) {
      await updateMutation.mutateAsync({
        id: maintenanceId,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  });

  return {
    ...methods,
    formState,
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,
    handleSubmit: onSubmit,
  };
}
