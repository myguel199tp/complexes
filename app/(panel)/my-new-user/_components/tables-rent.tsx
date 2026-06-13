"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useState } from "react";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useTranslation } from "react-i18next";
import ModalInfo from "./modal/modal-info";
import ModalPay from "./modal/modal-pago";
import ModalCertification from "./modal/modal-certification";
import { IoSearchCircle } from "react-icons/io5";
import { useLanguage } from "@/app/hooks/useLanguage";
import { ImSpinner9 } from "react-icons/im";
import { useUsersQuery } from "./use-users-query";

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

  const { data, isLoading, error } = useUsersQuery(page, limit);

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

  const tenantsOnly = data?.data?.filter((user) => user.role === "tenant");

  const { rows, cellClasses } = tenantsOnly
    .filter((user) => {
      const filterLower = filterText.toLowerCase();

      const vehicleString = user.vehicles?.length
        ? user.vehicles
            .map((v) => `${v.assignmentNumber} - ${v.plaque}`)
            .join(", ")
            .toLowerCase()
        : "";

      return (
        user.user.name?.toLowerCase().includes(filterLower) ||
        user.user.lastName?.toLowerCase().includes(filterLower) ||
        user.tower?.toLowerCase().includes(filterLower) ||
        user.apartment?.toLowerCase().includes(filterLower) ||
        vehicleString.includes(filterLower)
      );
    })
    .reduce(
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
      <div className="flex">
        <InputField
          placeholder={t("buscarNoticia")}
          prefixElement={<IoSearchCircle size={15} />}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      <p className="text-xs text-gray-400 flex items-center gap-1">
        <span>👆</span> Haz clic en una fila para ver el detalle del arrendatario
      </p>

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
