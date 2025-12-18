"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { maintenanceSchema } from "../schemas/maintenance.schema";
import { useCreateMaintenance } from "../hooks/useCreateMaintenance";
import { MaintenanceFrequency } from "../types/maintenance.types";

export default function MaintenanceForm({
  conjuntoId,
}: {
  conjuntoId: string;
}) {
  const { mutate, isPending } = useCreateMaintenance();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(maintenanceSchema),
    defaultValues: {
      conjuntoId,
    },
  });

  const onSubmit = (data: any) => {
    mutate(data, {
      onSuccess: () => reset(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Zona común */}
      <input
        {...register("commonAreaId")}
        placeholder="Zona común ID"
        className="input"
      />
      {errors.commonAreaId && (
        <p className="text-red-500">{errors.commonAreaId.message}</p>
      )}

      {/* Proveedor */}
      <input
        {...register("providerId")}
        placeholder="Proveedor ID"
        className="input"
      />

      {/* Fecha */}
      <input
        type="date"
        {...register("lastMaintenanceDate")}
        className="input"
      />

      {/* Frecuencia */}
      <select {...register("frequency")} className="input">
        {Object.values(MaintenanceFrequency).map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      {/* Notas */}
      <textarea {...register("notes")} placeholder="Notas" className="input" />

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Guardando..." : "Crear mantenimiento"}
      </button>
    </form>
  );
}
