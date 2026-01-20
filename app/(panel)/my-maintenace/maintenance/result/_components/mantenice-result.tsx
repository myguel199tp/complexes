"use client";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  useCompleteMaintenance,
  useDeleteMaintenance,
  useMaintenances,
} from "../../_components/useMaintenance";

export default function MaintenanceResult() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const { data, isLoading } = useMaintenances(String(conjuntoId));
  const deleteMutation = useDeleteMaintenance();
  const completeMutation = useCompleteMaintenance();

  if (isLoading) return <p>Cargando...</p>;

  return (
    <>
      {data?.map((m: any) => (
        <div key={m.id}>
          <p>{m.commonArea.name}</p>
          <p>{m.status}</p>

          <button onClick={() => completeMutation.mutate(m.id)}>
            Marcar realizado
          </button>

          <button onClick={() => deleteMutation.mutate(m.id)}>Eliminar</button>
        </div>
      ))}
    </>
  );
}
