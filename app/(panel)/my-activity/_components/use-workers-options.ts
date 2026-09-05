"use client";

import { useMemo } from "react";
import { useUsersQuery } from "../../my-new-user/_components/use-users-query";
import { isWorkerRole } from "../../my-new-user/_components/constants";

/**
 * Opciones para el select "Encargado de la actividad": los colaboradores
 * listados en el tab "Todos los colaboradores" de /my-new-user.
 *
 * El `value` es el id del colaborador, no su nombre. Con el nombre el backend
 * no puede autorizar nada —dos colaboradores homónimos serían la misma
 * persona—, y de ese id depende quién puede escanear el QR de una reserva y a
 * quién se le arma la agenda del día. El nombre se sigue enviando aparte, en
 * `inChargue`, para mostrarlo en la cartelera.
 */
export default function useWorkersOptions() {
  const { data, isLoading } = useUsersQuery(1, 1000);

  const { workerOptions, workerNameById } = useMemo(() => {
    const workers = data?.data?.filter((user) => isWorkerRole(user.role)) ?? [];

    const options = workers
      .map((worker) => {
        const label =
          `${worker.user?.name ?? ""} ${worker.user?.lastName ?? ""}`.trim();

        return { value: worker.user?.id ?? "", label };
      })
      .filter((option) => option.value !== "" && option.label !== "")
      .sort((a, b) => a.label.localeCompare(b.label));

    const byId = new Map(options.map((o) => [o.value, o.label]));

    return { workerOptions: options, workerNameById: byId };
  }, [data]);

  return { workerOptions, workerNameById, isLoadingWorkers: isLoading };
}
