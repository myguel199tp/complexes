"use client";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  useCompleteMaintenance,
  useDeleteMaintenance,
  useMaintenances,
} from "../../_components/useMaintenance";
import MessageNotData from "@/app/components/messageNotData";
import { ImSpinner9 } from "react-icons/im";

export default function MaintenanceResult() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const { data, isLoading } = useMaintenances(String(conjuntoId));
  const deleteMutation = useDeleteMaintenance(conjuntoId);
  const completeMutation = useCompleteMaintenance(conjuntoId);

  if (isLoading) return <ImSpinner9 className="animate-spin text-base" />;

  if (!data || data.length === 0) {
    return <MessageNotData />;
  }

  return (
    <>
      {data.map((m) => (
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
