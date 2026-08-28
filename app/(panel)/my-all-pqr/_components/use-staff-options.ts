"use client";

import { useMemo } from "react";
import { useUsersQuery } from "../../my-new-user/_components/use-users-query";
import { isWorkerRole } from "../../my-new-user/_components/constants";

/** Etiqueta en español del rol, para distinguir homónimos en el select. */
const ROLE_LABELS: Record<string, string> = {
  porter: "Portería",
  cleaner: "Aseo",
  maintenance: "Mantenimiento",
  gardener: "Jardinería",
  pool_technician: "Piscina",
  accountant: "Contabilidad",
  messenger: "Mensajería",
  logistics_assistant: "Logística",
  community_manager: "Administración",
  event_staff: "Eventos",
  trainer: "Entrenador",
};

/**
 * Opciones para el select "Encargado" de la respuesta de una PQR: los mismos
 * colaboradores del tab "Todos los colaboradores" de /my-new-user que ya usa
 * el encargado de actividad en /my-activity/activity.
 *
 * A diferencia de aquel, aquí el `value` es el id del usuario y no su nombre:
 * el backend lo necesita para que la petición le aparezca al colaborador en
 * /my-vip.
 */
export function useStaffOptions() {
  const { data, isLoading } = useUsersQuery(1, 1000);

  const staffOptions = useMemo(() => {
    const workers = data?.data?.filter((relation) =>
      isWorkerRole(relation.role),
    ) ?? [];

    return workers
      .map((worker) => {
        const name =
          `${worker.user?.name ?? ""} ${worker.user?.lastName ?? ""}`.trim();
        const roleLabel = ROLE_LABELS[worker.role] ?? "";

        return {
          value: worker.user?.id ?? "",
          label: roleLabel ? `${name} - ${roleLabel}` : name,
          name,
        };
      })
      .filter((option) => option.value !== "" && option.name !== "")
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  return { staffOptions, isLoadingStaff: isLoading };
}
