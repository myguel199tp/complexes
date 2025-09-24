"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { allUserService } from "../services/usersService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { IoSearchCircle } from "react-icons/io5";
import { useTranslation } from "react-i18next";

export default function Tables() {
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";
  const [data, setData] = useState<EnsembleResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");
  const { t } = useTranslation();
  console.log("data..", data);
  useEffect(() => {
    const fetchData = async () => {
      if (!infoConjunto) return;
      try {
        const result = await allUserService(infoConjunto);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errorDesconocido"));
      }
    };
    fetchData();
  }, [infoConjunto, t]);
  if (error) {
    return <div>{error}</div>;
  }
  const headers = [
    t("nombre"),
    t("apellido"),
    t("torre"),
    t("numeroInmuebleResidencial"),
    t("habita"),
    t("numeroPlaca"),
  ];

  const filteredRows = data
    .filter((user) => {
      const filterLower = filterText.toLowerCase();
      return (
        user.user.name?.toLowerCase().includes(filterLower) ||
        user.user.lastName?.toLowerCase().includes(filterLower) ||
        user.tower?.toLowerCase().includes(filterLower) ||
        user.apartment?.toLowerCase().includes(filterLower) ||
        String(user.isMainResidence).toLowerCase().includes(filterLower) ||
        user.plaque?.toLowerCase().includes(filterLower)
      );
    })
    .map((user) => [
      user.user.name || "",
      user.user.lastName || "",
      user.tower || "",
      user.apartment || "",
      user.isMainResidence === true ? t("recidesi") : t("recideno"),
      user.plaque || "",
    ]);

  const cellClasses = headers.map(() => ["", "", ""]);

  return (
    <div className="w-full p-4">
      <div className="relative mt-4 w-full">
        <IoSearchCircle
          size={24}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <InputField
          placeholder={t("buscarNoticia")}
          helpText={t("buscarNoticia")}
          value={filterText}
          sizeHelp="sm"
          onChange={(e) => setFilterText(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>

      <Table
        headers={headers}
        rows={filteredRows}
        borderColor="Text-gray-500"
        cellClasses={cellClasses}
        columnWidths={["20%", "20%", "15%", "20%", "10%", "10%"]}
      />
    </div>
  );
}
