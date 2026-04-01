/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { Buton, InputField, Table } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { holllidayInfoService } from "../../../services/hollidayInfoService";
import { HollidayInfoResponses } from "../../../services/response/holllidayInfoResponse";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { IoReturnDownBackOutline, IoSearchCircle } from "react-icons/io5";
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
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";
import { ImSpinner9 } from "react-icons/im";
import { HeaderAction } from "@/app/components/header";
import { FaCogs } from "react-icons/fa";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

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
  const { countryOptions, data: datacountry } = useCountryCityOptions();

  const [selectedItem, setSelectedItem] =
    useState<HollidayInfoResponses | null>(null);
  const storedUserId = useConjuntoStore((state) => state.userId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await holllidayInfoService(storedUserId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    fetchData();
  }, [storedUserId]);

  if (error) {
    return <div>{error}</div>;
  }

  const headers = [
    "Código",
    "Tipo",
    "Lugar",
    "Precio",
    "Promoción",
    "Fecha inicio y fin",
    "Acciones",
  ];

  const filteredData = data?.filter((item) => {
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

  if (!datacountry || !countryOptions || countryOptions.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  }

  const rows = filteredData.map((item) => {
    const countryUser =
      countryOptions.find((c) => c.value === String(item.country))?.label || "";

    const cityUser =
      datacountry
        ?.find((c) => String(c.ids) === String(item.country))
        ?.city?.find((c) => String(c.id) === String(item.city))?.name ||
      item.city;

    return [
      item.codigo || "",
      item.property || "",
      `${countryUser || ""} | ${cityUser || ""} | ${item.neigborhood || ""} | ${
        item.address || ""
      }`,
      `$${item.price || ""}`,
      `%${item.promotion || ""}`,
      `${item.startDate || ""} - ${item.endDate || ""}`,

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
    ];
  });

  const cellClasses = filteredData.map((item) =>
    headers.map(() =>
      item.publishStatus === "draft"
        ? "bg-blue-50 bg-cyan-300 font-semibold"
        : "bg-white text-gray-900",
    ),
  );
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    setLoading(true);
    router.push(route.vacations);
  };

  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div key={language} className="w-full p-4">
      <HeaderAction
        title="Reserva registradas"
        tooltip={t("registerVacaltional")}
        onClick={handleBack}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <IoReturnDownBackOutline color="white" size={34} />
          )
        }
        iconc={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <FaCogs color="white" size={22} />
          )
        }
        idicative={t("registerVacaltional")}
      />

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
            files: selectedItem.files as [],
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
