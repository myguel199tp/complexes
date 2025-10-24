"use client";

import {
  Badge,
  Buton,
  InputField,
  Table,
  Text,
  Title,
  Tooltip,
} from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { holllidayInfoService } from "../../../services/hollidayInfoService";
import { HollidayInfoResponses } from "../../../services/response/holllidayInfoResponse";
import { FaMoneyBillTrendUp, FaTableList } from "react-icons/fa6";
import { IoSearchCircle } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { MdDeleteForever, MdHolidayVillage } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import ModalPayHoliday from "./modal/modal";
import ModalSummary from "./modal/modal-summary";
import ModalRemove from "./modal/modal-remove";
import Modaledit from "./modal/modal-edit";

export default function TablesVacation() {
  const router = useRouter();
  const [data, setData] = useState<HollidayInfoResponses[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");
  const [openModalPay, setOpenModalPay] = useState(false);
  const [openModalSummary, setOpenModalSummary] = useState(false);
  const [openModalRemove, setOpenModalRemove] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);

  const [selectedItem, setSelectedItem] =
    useState<HollidayInfoResponses | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await holllidayInfoService();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  // Columnas de la tabla
  const headers = [
    "Código",
    "Tipo",
    "Lugar",
    "Precio",
    "Promoción",
    "Estado",
    "Fecha inicio y fin",
    "Acciones",
  ];

  // Filtrado de registros
  const filteredData = data.filter((item) => {
    const filterLower = filterText?.toLowerCase();
    return (
      item.codigo?.toLowerCase().includes(filterLower) ||
      item.property?.toLowerCase().includes(filterLower) ||
      item.country?.toLowerCase().includes(filterLower) ||
      item.city?.toLowerCase().includes(filterLower) ||
      item.neigborhood?.toLowerCase().includes(filterLower) ||
      item.address?.toLowerCase().includes(filterLower) ||
      String(item.price)?.toLowerCase().includes(filterLower) ||
      String(item.promotion)?.toLowerCase().includes(filterLower) ||
      String(item.status)?.toLowerCase().includes(filterLower) ||
      item.startDate?.toLowerCase().includes(filterLower) ||
      item.endDate?.toLowerCase().includes(filterLower)
    );
  });

  // Estructura de filas
  const rows = filteredData.map((item) => [
    item.codigo || "",
    item.property || "",
    `${item.country || ""} | ${item.city || ""} | ${item.neigborhood || ""} | ${
      item.address || ""
    }`,
    `$${item.price || ""}`,
    `%${item.promotion || ""}`,

    // 🔽 Aquí reemplazamos el item.status por un switch
    <div
      key={`switch-${item.id}`}
      className="flex justify-center items-center pointer-events-auto"
    >
      <label className="relative inline-flex items-center cursor-pointer select-none">
        <input
          type="checkbox"
          checked={item.status || false}
          onChange={(e) => {
            const newStatus = e.target.checked;
            console.log(`Nuevo estado para ${item.codigo}:`, newStatus);
            setData((prev) =>
              prev.map((d) =>
                d.id === item.id ? { ...d, status: newStatus } : d
              )
            );
          }}
          className="sr-only peer"
        />
        <div
          className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-cyan-800
      after:content-[''] after:absolute after:top-[2px] after:left-[2px]
      after:bg-white after:border-gray-300 after:border after:rounded-full
      after:h-5 after:w-5 after:transition-all duration-300 ease-in-out
      peer-checked:after:translate-x-full"
        ></div>
      </label>
    </div>,
    `${item.startDate || ""} - ${item.endDate || ""}`,

    <div
      className="flex gap-4 justify-center items-center"
      key={`actions-${item.id}`}
    >
      <Buton
        size="sm"
        borderWidth="thin"
        rounded="lg"
        onClick={() => {
          setOpenModalRemove(true);
        }}
      >
        <MdDeleteForever color="red" size={20} />
      </Buton>
      <Buton
        size="sm"
        borderWidth="thin"
        rounded="lg"
        onClick={() => {
          setOpenModalEdit(true);
        }}
      >
        <FaEdit color="blue" size={20} />
      </Buton>
      <Buton
        size="sm"
        borderWidth="thin"
        rounded="lg"
        onClick={() => {
          setSelectedItem(item);
          setOpenModalSummary(true);
        }}
      >
        <MdHolidayVillage color="purple" size={20} />
      </Buton>
      <Buton
        size="sm"
        borderWidth="thin"
        rounded="lg"
        onClick={() => setOpenModalPay(true)}
      >
        <FaMoneyBillTrendUp color="green" size={20} />
      </Buton>
    </div>,
  ]);
  const cellClasses = rows.map(() =>
    headers.map(() => "bg-white text-gray-900")
  );

  return (
    <div className="w-full p-4">
      <div className="w-full flex justify-between items-center bg-cyan-800 shadow-lg opacity-90 p-3 rounded-md">
        <div className="cursor-pointer">
          <Tooltip
            content="Ver todas las reservas"
            className="cursor-pointer bg-gray-200"
            position="right"
          >
            <FaTableList
              color="white"
              size={30}
              onClick={() => router.push(route.vacations)}
            />
          </Tooltip>
        </div>
        <Title size="sm" font="bold" colVariant="on" translate="yes">
          Vacaciones registradas
        </Title>
      </div>
      {/* Buscador */}
      <div className="flex gap-4 mt-4 w-full">
        <InputField
          prefixElement={
            <IoSearchCircle
              size={24}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          }
          placeholder="Buscar"
          helpText="Buscar por código, país, ciudad o dirección"
          value={filterText}
          sizeHelp="xs"
          inputSize="sm"
          rounded="lg"
          onChange={(e) => setFilterText(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>
      {/* Tabla */}
      <Table
        headers={headers}
        rows={rows}
        borderColor="Text-gray-500"
        cellClasses={cellClasses}
        columnWidths={["15%", "15%", "15%", "15%", "15%", "15%", "15%", "15%"]}
      />
      <ModalRemove
        isOpen={openModalRemove}
        onClose={() => setOpenModalRemove(false)}
      />
      <Modaledit
        isOpen={openModalEdit}
        onClose={() => setOpenModalEdit(false)}
      />
      <ModalPayHoliday
        isOpen={openModalPay}
        onClose={() => setOpenModalPay(false)}
      />
      {selectedItem && (
        <ModalSummary
          isOpen={openModalSummary}
          onClose={() => setOpenModalSummary(false)}
          {...{
            ...selectedItem,
            files: selectedItem.files as any[],
          }}
        />
      )}
    </div>
  );
}
