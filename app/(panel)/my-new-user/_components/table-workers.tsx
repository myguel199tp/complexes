"use client";

import { Text } from "complexes-next-components";
import { Table } from "@/app/components/ui/table";
import React, { useEffect, useState } from "react";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useTranslation } from "react-i18next";
import ModalInfo from "./modal/modal-info";
import ModalPay from "./modal/modal-pago";
import ModalCertification from "./modal/modal-certification";
import ModalAssignTask from "./modal/ModalAssignTask";
import { IoSearchCircle } from "react-icons/io5";
import { useLanguage } from "@/app/hooks/useLanguage";
import { ImSpinner9 } from "react-icons/im";
import { useUsersQuery } from "./use-users-query";
import { WORKER_ROLES } from "./constants";
import { usePlanFeatures } from "@/app/hooks/usePlanFeatures";
import { InputField, SelectField } from "@/app/components/ui/form";
import { useDebouncedValue } from "@/app/hooks/useDebouncedValue";
import type { ResidenceFilter } from "../services/usersService";

export default function TablesWorkers() {
  const [filterText, setFilterText] = useState("");
  const [filterMora, setFilterMora] = useState<ResidenceFilter>("");

  const [openModalInfo, setOpenModalInfo] = useState(false);
  const [openModalPay, setOpenModalPay] = useState(false);
  const [openModalCertification, setOpenModalCertification] = useState(false);
  const [openModalTask, setOpenModalTask] = useState(false);

  const [selectedUser, setSelectedUser] = useState<EnsembleResponse | null>(
    null,
  );

  const { t } = useTranslation();
  const { language } = useLanguage();

  const [page, setPage] = useState(1);
  const limit = 10;

  // Rol, búsqueda, "reside" y paginación se resuelven en el backend. Si se
  // filtraba aquí la página que llegaba, los colaboradores podían quedar en la
  // página 3 y las primeras se veían vacías.
  const debouncedSearch = useDebouncedValue(filterText, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterMora]);

  const { data, isLoading, isFetching, error } = useUsersQuery(page, limit, {
    roles: WORKER_ROLES,
    search: debouncedSearch,
    residence: filterMora,
  });

  /*
    Asignar tareas es del tablero de tareas, que el plan básico no incluye: la
    columna entera sobra ahí. Se lee antes de los returns tempranos porque es un
    hook. Mientras carga, `usePlanFeatures` devuelve lo más restrictivo.
  */
  const { features: planFeatures } = usePlanFeatures();
  const canAssignTasks = planFeatures.taskBoard;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );

  if (error) return <div>{t("errorDesconocido")}</div>;

  const headers = [
    t("nombre"),
    t("apellido"),
    t("habita"),
    t("numeroPlaca"),
    ...(canAssignTasks ? ["Tarea"] : []),
  ];

  // Sin la columna de tarea el ancho sobrante se reparte en las demás.
  const columnWidths = canAssignTasks
    ? ["22%", "22%", "16%", "24%", "16%"]
    : ["26%", "26%", "18%", "30%"];

  // Ya viene filtrado y paginado desde el backend.
  const { rows, cellClasses } = (data?.data ?? []).reduce(
    (acc, user) => {
      const vehiclesText = user.vehicles?.length
        ? user.vehicles
            .map((v) => `${v.assignmentNumber} - ${v.plaque}`)
            .join(", ")
        : t("sinVehiculo");

      const handleRowClick = () => {
        setSelectedUser(user);
        setOpenModalInfo(true);
      };

      const handleAssignTask = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedUser(user);
        setOpenModalTask(true);
      };

      const cells = [
        user.user.name,
        user.user.lastName,
        user.isMainResidence ? t("recidesi") : t("recideno"),
        vehiclesText,
      ];

      acc.rows.push([
        ...cells.map((cell, i) => (
          <div
            key={`${user.id}-${i}`}
            className="cursor-pointer py-1"
            onClick={handleRowClick}
          >
            {cell}
          </div>
        )),
        ...(canAssignTasks
          ? [
              <button
                key={`${user.id}-task`}
                type="button"
                onClick={handleAssignTask}
                className="px-3 py-1 rounded-md bg-cyan-600 text-white text-xs font-medium hover:bg-cyan-700 transition-colors"
              >
                Asignar tarea
              </button>,
            ]
          : []),
      ]);

      acc.cellClasses.push(
        headers.map(() => "bg-white hover:bg-cyan-50 transition-colors"),
      );
      return acc;
    },
    { rows: [] as React.ReactNode[][], cellClasses: [] as string[][] },
  );

  return (
    <div key={language} className="w-full space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        <InputField
          regexType="safeChars"
          placeholder={t("buscarNoticia")}
          prefixElement={<IoSearchCircle size={15} />}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />

        {isFetching && (
          <ImSpinner9
            className="shrink-0 animate-spin text-cyan-800"
            size={18}
          />
        )}

        <SelectField
          helpText={t("habita")}
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
          defaultOption={t("habita")}
          options={[
            { value: "", label: t("habita") },
            { value: "si", label: t("recidesi") },
            { value: "no", label: t("recideno") },
          ]}
          value={filterMora}
          onChange={(e) => setFilterMora(e.target.value as ResidenceFilter)}
        />
      </div>

      <Text size="xs" className="text-gray-400 flex items-center gap-1">
        <span>👆</span> Haz clic en una fila para ver el detalle del colaborador
      </Text>

      <Table
        headers={headers}
        rows={rows}
        cellClasses={cellClasses}
        columnWidths={columnWidths}
        serverPagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        rowsPerPage={limit}
      />

      <ModalInfo
        isOpen={openModalInfo}
        onClose={() => setOpenModalInfo(false)}
        selectedUser={selectedUser}
      />

      <ModalPay
        isOpen={openModalPay}
        onClose={() => setOpenModalPay(false)}
        selectedUser={selectedUser}
      />

      <ModalCertification
        isOpen={openModalCertification}
        onClose={() => setOpenModalCertification(false)}
        selectedUser={selectedUser}
      />

      {canAssignTasks && (
        <ModalAssignTask
          isOpen={openModalTask}
          onClose={() => setOpenModalTask(false)}
          assignedToId={selectedUser?.user?.id}
          assignedToName={`${selectedUser?.user?.name ?? ""} ${
            selectedUser?.user?.lastName ?? ""
          }`.trim()}
        />
      )}
    </div>
  );
}
