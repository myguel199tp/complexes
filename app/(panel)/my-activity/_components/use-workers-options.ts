"use client";

import { useMemo } from "react";
import { useUsersQuery } from "../../my-new-user/_components/use-users-query";
import { isWorkerRole } from "../../my-new-user/_components/constants";

/**
 * Opciones para el select "Encargado de la actividad": los colaboradores
 * listados en el tab "Todos los colaboradores" de /my-new-user.
 */
export default function useWorkersOptions() {
  const { data, isLoading } = useUsersQuery(1, 1000);

  const workerOptions = useMemo(() => {
    const workers = data?.data?.filter((user) => isWorkerRole(user.role)) ?? [];

    return workers
      .map((worker) => {
        const label =
          `${worker.user?.name ?? ""} ${worker.user?.lastName ?? ""}`.trim();
        return { value: label, label };
      })
      .filter((option) => option.value !== "")
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  return { workerOptions, isLoadingWorkers: isLoading };
}
