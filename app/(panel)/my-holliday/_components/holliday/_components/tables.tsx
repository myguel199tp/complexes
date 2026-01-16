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
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { IoSearchCircle } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import {
  MdDeleteForever,
  MdHolidayVillage,
  MdOutlinePublish,
} from "react-icons/md";
import { TfiAgenda } from "react-icons/tfi";
import ModalPayHoliday from "./modal/modal";
import ModalSummary from "./modal/modal-summary";
import ModalRemove from "./modal/modal-remove";
import ModalRecomendation from "./modal/modal-recomendation";
import ModalPublish from "./modal/modal-publish";
import MessageNotData from "@/app/components/messageNotData";
import { CiViewTable } from "react-icons/ci";

export default function TablesVacation() {
  const router = useRouter();
  const [data, setData] = useState<HollidayInfoResponses[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");

  const [openModalPay, setOpenModalPay] = useState(false);
  const [openModalSummary, setOpenModalSummary] = useState(false);
  const [openModalRemove, setOpenModalRemove] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalPublish, setOpenModalPublish] = useState(false);

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

  /* =======================
     COLUMNAS
  ======================== */
  const headers = [
    "Código",
    "Tipo",
    "Lugar",
    "Precio",
    "Promoción",
    "Fecha inicio y fin",
    "Acciones",
  ];

  /* =======================
     FILTRO
  ======================== */
  const filteredData = data.filter((item) => {
    const filterLower = filterText.toLowerCase();
    return (
      item.codigo?.toLowerCase().includes(filterLower) ||
      item.property?.toLowerCase().includes(filterLower) ||
      item.country?.toLowerCase().includes(filterLower) ||
      item.city?.toLowerCase().includes(filterLower) ||
      item.neigborhood?.toLowerCase().includes(filterLower) ||
      item.address?.toLowerCase().includes(filterLower) ||
      String(item.price)?.toLowerCase().includes(filterLower) ||
      String(item.promotion)?.toLowerCase().includes(filterLower) ||
      item.startDate?.toLowerCase().includes(filterLower) ||
      item.endDate?.toLowerCase().includes(filterLower)
    );
  });

  /* =======================
     FILAS
  ======================== */
  const rows = filteredData.map((item) => [
    item.codigo || "",
    item.property || "",
    `${item.country || ""} | ${item.city || ""} | ${item.neigborhood || ""} | ${
      item.address || ""
    }`,
    `$${item.price || ""}`,
    `%${item.promotion || ""}`,
    `${item.startDate || ""} - ${item.endDate || ""}`,

    // ACCIONES
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
          setSelectedItem(item);
          setOpenModalEdit(true);
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

      <Buton
        size="xs"
        borderWidth="none"
        rounded="lg"
        onClick={() => {
          setSelectedItem(item);
          setOpenModalPublish(true);
        }}
      >
        <MdOutlinePublish color="orange" size={20} />
      </Buton>
    </div>,
  ]);

  /* =======================
     🎨 COLORES POR FILA
     ❌ NO publicado → rojo
     ✅ Publicado → blanco
  ======================== */
  const cellClasses = filteredData.map((item) =>
    headers.map(() =>
      item.publishStatus === "draft"
        ? "bg-blue-50 bg-cyan-300 font-semibold"
        : "bg-white text-gray-900"
    )
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
            <div className="bg-white/20 p-2 rounded-full cursor-pointer">
              <CiViewTable
                color="white"
                size={34}
                onClick={() => {
                  router.push(route.vacations);
                }}
              />
            </div>
          </Tooltip>
        </div>
        <Title size="sm" font="bold" colVariant="on" translate="yes">
          Vacaciones registradas
        </Title>
      </div>

      {/* BUSCADOR */}

      {filteredData.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      ) : (
        <>
          <InputField
            placeholder="Buscar"
            helpText="Buscar por código, país, ciudad o dirección"
            value={filterText}
            prefixElement={<IoSearchCircle />}
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            onChange={(e) => setFilterText(e.target.value)}
            className="mt-2"
          />
          <Table
            headers={headers}
            rows={rows}
            sizeText="sm"
            size="sm"
            fontText="bold"
            colVariant="primary"
            borderColor="Text-gray-500"
            cellClasses={cellClasses}
            columnWidths={["8%", "8%", "20%", "8%", "8%", "20%", "20%"]}
          />
        </>
      )}

      {/* MODALES */}
      <ModalRemove
        isOpen={openModalRemove}
        onClose={() => setOpenModalRemove(false)}
      />

      {selectedItem && (
        <ModalRecomendation
          hollidayId={selectedItem.id}
          isOpen={openModalEdit}
          onClose={() => setOpenModalEdit(false)}
        />
      )}

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

      {selectedItem && (
        <ModalPublish
          isOpen={openModalPublish}
          onClose={() => setOpenModalPublish(false)}
          hollidayId={selectedItem.id}
        />
      )}
    </div>
  );
}
