"use client";

import { Buton, Tooltip } from "complexes-next-components";
import { Table } from "@/app/components/ui/table";
import React, { useCallback, useEffect, useState } from "react";
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
  MdPauseCircleOutline,
  MdPlayCircleOutline,
} from "react-icons/md";
import { TfiAgenda } from "react-icons/tfi";
import { FaCalendarCheck, FaGlobe, FaStar, FaUsers } from "react-icons/fa";
import ModalPayHoliday from "./modal/modal";
import ModalSummary from "./modal/modal-summary";
import ModalRemove from "./modal/modal-remove";
import ModalRecomendation from "./modal/modal-recomendation";
import ModalPublish from "./modal/modal-publish";
import ModalExternal from "./modal/modal-external";
import ModalGuests from "./modal/modal-guests";
import ModalBlockDates from "./modal/modal-block-dates";
import ModalBookings from "./modal/modal-bookings";
import ModalHostReviews from "./modal/modal-host-reviews";
import GuestReviewsPanel from "./guest-reviews-panel";
import { MdEventBusy } from "react-icons/md";
import MessageNotData from "@/app/components/messageNotData";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";
import { ImSpinner9 } from "react-icons/im";
import { HeaderAction } from "@/app/components/header";
import { FaCogs } from "react-icons/fa";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { InputField } from "@/app/components/ui/form";
import { pauseHolliday } from "../../../services/hollidayManageService";

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  paused: "Pausado",
};

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  paused: "bg-slate-200 text-slate-700",
};

export default function TablesVacation() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [data, setData] = useState<HollidayInfoResponses[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pausingId, setPausingId] = useState<string | null>(null);

  const [openModalPay, setOpenModalPay] = useState(false);
  const [openModalSummary, setOpenModalSummary] = useState(false);
  const [openModalRemove, setOpenModalRemove] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalPublish, setOpenModalPublish] = useState(false);
  const [openModalExternal, setOpenModalExternal] = useState(false);
  const [openModalGuests, setOpenModalGuests] = useState(false);
  const [openModalBlockDates, setOpenModalBlockDates] = useState(false);
  const [openModalBookings, setOpenModalBookings] = useState(false);
  const [openModalReviews, setOpenModalReviews] = useState(false);
  const { countryOptions, data: datacountry } = useCountryCityOptions();

  const [selectedItem, setSelectedItem] =
    useState<HollidayInfoResponses | null>(null);
  const storedUserId = useConjuntoStore((state) => state.userId);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const fetchData = useCallback(async () => {
    try {
      const result = await holllidayInfoService(storedUserId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }, [storedUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePause = async (item: HollidayInfoResponses) => {
    if (
      !confirm(
        "El inmueble dejará de aparecer en la búsqueda. Las reservas que ya tiene siguen en pie. ¿Pausar?",
      )
    ) {
      return;
    }

    setPausingId(item.id);
    try {
      await pauseHolliday(conjuntoId, item.id);
      await fetchData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo pausar el inmueble");
    } finally {
      setPausingId(null);
    }
  };

  const handleBack = () => {
    setLoading(true);
    router.push(route.vacations);
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!datacountry || !countryOptions || countryOptions.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  }

  const headers = [
    "Código",
    "Tipo",
    "Lugar",
    "Precio",
    "Estado",
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

  const open = (item: HollidayInfoResponses, setter: (v: boolean) => void) => {
    setSelectedItem(item);
    setter(true);
  };

  const rows = filteredData.map((item) => {
    const countryUser =
      countryOptions.find((c) => c.value === String(item.country))?.label || "";

    const cityUser =
      datacountry
        ?.find((c) => String(c.ids) === String(item.country))
        ?.city?.find((c) => String(c.id) === String(item.city))?.name ||
      item.city;

    const status = item.publishStatus;
    const canPublish = status === "draft" || status === "paused";

    return [
      item.codigo || "",
      item.property || "",
      `${countryUser || ""} | ${cityUser || ""} | ${item.neigborhood || ""} | ${
        item.address || ""
      }`,
      `$${item.price || ""}${item.promotion ? ` (-${item.promotion}%)` : ""}`,
      <span
        key={`status-${item.id}`}
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          STATUS_STYLE[status] ?? "bg-gray-100 text-gray-700"
        }`}
      >
        {STATUS_LABEL[status] ?? status}
      </span>,
      `${item.startDate || ""} - ${item.endDate || ""}`,

      <div
        className="flex flex-wrap gap-2 justify-center items-center"
        key={`actions-${item.id}`}
      >
        <Tooltip className="bg-gray-200 w-20" position="top" content="Reservas">
          <Buton
            size="xs"
            borderWidth="none"
            rounded="lg"
            onClick={() => open(item, setOpenModalBookings)}
          >
            <FaCalendarCheck color="#0e7490" size={18} />
          </Buton>
        </Tooltip>
        <Tooltip className="bg-gray-200 w-20" position="top" content="Reseñas">
          <Buton
            size="xs"
            borderWidth="none"
            rounded="lg"
            onClick={() => open(item, setOpenModalReviews)}
          >
            <FaStar color="#f59e0b" size={18} />
          </Buton>
        </Tooltip>
        <Tooltip
          className="bg-gray-200 w-20"
          position="top"
          content="Cuenta de págo"
        >
          <Buton
            size="xs"
            borderWidth="none"
            rounded="lg"
            onClick={() => open(item, setOpenModalPay)}
          >
            <FaMoneyBillTrendUp color="green" size={20} />
          </Buton>
        </Tooltip>
        {canPublish && (
          <Tooltip
            className="bg-gray-200"
            position="top"
            content={status === "paused" ? "Reanudar" : "Publicar"}
          >
            <Buton
              size="xs"
              borderWidth="none"
              rounded="lg"
              onClick={() => open(item, setOpenModalPublish)}
            >
              {status === "paused" ? (
                <MdPlayCircleOutline color="green" size={20} />
              ) : (
                <MdOutlinePublish color="orange" size={20} />
              )}
            </Buton>
          </Tooltip>
        )}
        {status === "published" && (
          <Tooltip className="bg-gray-200" position="top" content="Pausar">
            <Buton
              size="xs"
              borderWidth="none"
              rounded="lg"
              disabled={pausingId === item.id}
              onClick={() => handlePause(item)}
            >
              {pausingId === item.id ? (
                <ImSpinner9 className="animate-spin" size={16} />
              ) : (
                <MdPauseCircleOutline color="#64748b" size={20} />
              )}
            </Buton>
          </Tooltip>
        )}
        <Tooltip
          className="bg-gray-200 w-24"
          position="top"
          content="Huéspedes actuales"
        >
          <Buton
            size="xs"
            borderWidth="none"
            rounded="lg"
            onClick={() => open(item, setOpenModalGuests)}
          >
            <FaUsers color="#0e7490" size={20} />
          </Buton>
        </Tooltip>
        <Tooltip
          className="bg-gray-200"
          position="top"
          content="Ver y editar"
        >
          <Buton
            size="xs"
            borderWidth="none"
            rounded="lg"
            onClick={() => open(item, setOpenModalSummary)}
          >
            <MdHolidayVillage color="purple" size={20} />
          </Buton>
        </Tooltip>

        <Tooltip
          className="bg-gray-200"
          position="top"
          content="Turismo recomendación"
        >
          <Buton
            size="xs"
            borderWidth="none"
            rounded="lg"
            onClick={() => open(item, setOpenModalEdit)}
          >
            <TfiAgenda color="blue" size={20} />
          </Buton>
        </Tooltip>
        <Tooltip
          className="bg-gray-200 w-20"
          position="top"
          content="Bloquear fechas"
        >
          <Buton
            size="xs"
            borderWidth="none"
            rounded="lg"
            onClick={() => open(item, setOpenModalBlockDates)}
          >
            <MdEventBusy color="#b91c1c" size={20} />
          </Buton>
        </Tooltip>
        <Tooltip className="bg-gray-200" position="top" content="Eliminar">
          <Buton
            size="xs"
            borderWidth="none"
            rounded="lg"
            onClick={() => open(item, setOpenModalRemove)}
          >
            <MdDeleteForever color="red" size={20} />
          </Buton>
        </Tooltip>
        <Tooltip
          className="bg-gray-200 w-24"
          position="top"
          content="Plataformas externas (Airbnb/Booking/VRBO)"
        >
          <Buton
            size="xs"
            borderWidth="none"
            rounded="lg"
            onClick={() => open(item, setOpenModalExternal)}
          >
            <FaGlobe color="teal" size={20} />
          </Buton>
        </Tooltip>
      </div>,
    ];
  });

  const cellClasses = filteredData.map((item) =>
    headers.map(() =>
      item.publishStatus === "draft"
        ? "!bg-yellow-50 text-gray-900 font-semibold"
        : "!bg-white text-gray-900",
    ),
  );

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

      <GuestReviewsPanel />

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
            cellClasses={cellClasses}
            columnWidths={["8%", "8%", "20%", "8%", "8%", "18%", "30%"]}
          />
        </>
      )}

      <ModalRemove
        isOpen={openModalRemove}
        onClose={() => setOpenModalRemove(false)}
        hollidayId={selectedItem?.id}
        hollidayName={selectedItem?.name}
        onRemoved={fetchData}
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
        hollidayId={selectedItem?.id}
      />

      {selectedItem && (
        <ModalSummary
          isOpen={openModalSummary}
          onClose={() => setOpenModalSummary(false)}
          onSaved={fetchData}
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
          country={selectedItem.country}
          rntNumber={selectedItem.rntNumber}
          rntStatus={selectedItem.rntStatus}
          publishStatus={selectedItem.publishStatus}
          onPublished={fetchData}
        />
      )}

      {selectedItem && (
        <ModalExternal
          isOpen={openModalExternal}
          onClose={() => setOpenModalExternal(false)}
          hollidayId={selectedItem.id}
        />
      )}

      {selectedItem && (
        <ModalGuests
          isOpen={openModalGuests}
          onClose={() => setOpenModalGuests(false)}
          hollidayId={selectedItem.id}
        />
      )}

      {selectedItem && (
        <ModalBlockDates
          isOpen={openModalBlockDates}
          onClose={() => setOpenModalBlockDates(false)}
          hollidayId={selectedItem.id}
        />
      )}

      {selectedItem && (
        <ModalHostReviews
          isOpen={openModalReviews}
          onClose={() => setOpenModalReviews(false)}
          hollidayId={selectedItem.id}
        />
      )}

      {selectedItem && (
        <ModalBookings
          isOpen={openModalBookings}
          onClose={() => setOpenModalBookings(false)}
          hollidayId={selectedItem.id}
        />
      )}
    </div>
  );
}
