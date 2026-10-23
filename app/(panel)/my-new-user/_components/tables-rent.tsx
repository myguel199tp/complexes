"use client";

import { Text } from "complexes-next-components";
import { Table } from "@/app/components/ui/table";
import React, { useEffect, useState } from "react";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useTranslation } from "react-i18next";
import ModalInfo from "./modal/modal-info";
import ModalPay from "./modal/modal-pago";
import ModalCertification from "./modal/modal-certification";
import { IoSearchCircle } from "react-icons/io5";
import { useLanguage } from "@/app/hooks/useLanguage";
import { ImSpinner9 } from "react-icons/im";
import { useUsersQuery } from "./use-users-query";
import { InputField } from "@/app/components/ui/form";
import { useDebouncedValue } from "@/app/hooks/useDebouncedValue";

const TENANT_ROLES = ["tenant"];

export default function TablesRent() {
  const [filterText, setFilterText] = useState("");

  const [openModalInfo, setOpenModalInfo] = useState(false);
  const [openModalPay, setOpenModalPay] = useState(false);
  const [openModalCertification, setOpenModalCertification] = useState(false);

  const [selectedUser, setSelectedUser] = useState<EnsembleResponse | null>(
    null,
  );

  const { t } = useTranslation();
  const { language } = useLanguage();

  const [page, setPage] = useState(1);
  const limit = 10;

  // Rol, búsqueda y paginación se resuelven en el backend. Si se filtraba aquí
  // la página que llegaba, el único arrendatario podía estar en la página 3 y
  // las dos primeras se veían vacías.
  const debouncedSearch = useDebouncedValue(filterText, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching, error } = useUsersQuery(page, limit, {
    roles: TENANT_ROLES,
    search: debouncedSearch,
  });

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
    t("torre"),
    t("numeroInmuebleResidencial"),
    t("habita"),
    t("numeroPlaca"),
  ];

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

      const cells = [
        user.user.name,
        user.user.lastName,
        user.tower,
        user.apartment,
        user.isMainResidence ? t("recidesi") : t("recideno"),
        vehiclesText,
      ];

      acc.rows.push(
        cells.map((cell, i) => (
          <div
            key={`${user.id}-${i}`}
            className="cursor-pointer py-1"
            onClick={handleRowClick}
          >
            {cell}
          </div>
        )),
      );

      acc.cellClasses.push(
        headers.map(() => "bg-white hover:bg-cyan-50 transition-colors"),
      );
      return acc;
    },
    { rows: [] as React.ReactNode[][], cellClasses: [] as string[][] },
  );

  return (
    <div key={language} className="w-full space-y-2">
      <div className="flex items-center gap-2">
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
      </div>

      <Text size="xs" className="text-gray-400 flex items-center gap-1">
        <span>👆</span> Haz clic en una fila para ver el detalle del
        arrendatario
      </Text>

      <Table
        headers={headers}
        rows={rows}
        cellClasses={cellClasses}
        columnWidths={["18%", "18%", "10%", "14%", "14%", "26%"]}
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
    </div>
  );
}
