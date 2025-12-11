"use client";

import {
  Buton,
  InputField,
  Table,
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
import { TfiAgenda } from "react-icons/tfi";
import ModalPayHoliday from "./modal/modal";
import ModalSummary from "./modal/modal-summary";
import ModalRemove from "./modal/modal-remove";
import ModalRecomendation from "./modal/modal-recomendation";

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

    // Switch de estado
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
        />
      </label>
    </div>,

    `${item.startDate || ""} - ${item.endDate || ""}`,

    // Acciones
    <div
      className="flex gap-2 justify-center items-center"
      key={`actions-${item.id}`}
    >
      <Buton
        size="xs"
        borderWidth="none"
        rounded="lg"
        onClick={() => {
          setSelectedItem(item);
          setOpenModalRemove(true);
        }}
      >
        <MdDeleteForever color="red" size={20} />
      </Buton>

      <Buton
        size="xs"
        borderWidth="none"
        rounded="lg"
        onClick={() => {
          setSelectedItem(item); // 🔥 Aquí seleccionamos el item
          setOpenModalEdit(true); // 🔥 Abrir modal de recomendación
        }}
      >
        <TfiAgenda color="blue" size={20} />
      </Buton>

      <Buton
        size="xs"
        borderWidth="none"
        rounded="lg"
        onClick={() => {
          setSelectedItem(item);
          setOpenModalSummary(true);
        }}
      >
        <MdHolidayVillage color="purple" size={20} />
      </Buton>

      <Buton
        size="xs"
        borderWidth="none"
        rounded="lg"
        onClick={() => {
          setSelectedItem(item);
          setOpenModalPay(true);
        }}
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
      <InputField
        placeholder="Buscar"
        helpText="Buscar por código, país, ciudad o dirección"
        value={filterText}
        prefixElement={<IoSearchCircle />}
        sizeHelp="xs"
        inputSize="sm"
        rounded="lg"
        onChange={(e) => setFilterText(e.target.value)}
        className="mt-2"
      />

      {/* Tabla */}
      <Table
        headers={headers}
        rows={rows}
        sizeText="sm"
        size="sm"
        fontText="bold"
        borderColor="Text-gray-500"
        cellClasses={cellClasses}
        columnWidths={["8%", "8%", "20%", "8%", "8%", "8%", "20%", "20%"]}
      />

      {/* MODAL ELIMINAR */}
      <ModalRemove
        isOpen={openModalRemove}
        onClose={() => setOpenModalRemove(false)}
      />

      {/* MODAL RECOMENDACIÓN (EDITAR) */}
      {selectedItem && (
        <ModalRecomendation
          hollidayId={selectedItem.id} // 👈 Aquí se envía el ID del holiday
          isOpen={openModalEdit}
          onClose={() => setOpenModalEdit(false)}
        />
      )}

      {/* MODAL PAGO */}
      <ModalPayHoliday
        isOpen={openModalPay}
        onClose={() => setOpenModalPay(false)}
      />

      {/* MODAL RESUMEN */}
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
