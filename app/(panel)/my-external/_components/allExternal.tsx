"use client";
import React, { useMemo, useState } from "react";
import { useLanguage } from "@/app/hooks/useLanguage";
import { CiViewTable } from "react-icons/ci";
import { Buton, InputField, Table, Tabs, Text, Tooltip } from "complexes-next-components";
import { HeaderAction } from "@/app/components/header";
import { FaCogs } from "react-icons/fa";
import { ImSpinner9 } from "react-icons/im";
import { IoSearchCircle } from "react-icons/io5";
import { MdPaid } from "react-icons/md";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import MessageNotData from "@/app/components/messageNotData";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useMyExternalStays } from "./use-owner-stays-query";
import { useMarkOwnerStayAsPaidMutation } from "./use-stay-mutation";
import { OwnerExternalStayResponse } from "../services/externalStayService";

const platformLabel: Record<string, string> = {
  AIRBNB: "Airbnb",
  BOOKING: "Booking",
  VRBO: "VRBO",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  CANCELLED: "Cancelada",
};

const statusFilters = ["ALL", "PENDING", "PAID", "CANCELLED"] as const;

const money = (value: number | string | undefined) =>
  `$${Number(value ?? 0).toLocaleString("es-CO")}`;

const headers = [
  "Unidad",
  "Plataforma",
  "Huésped",
  "Fechas",
  "Huéspedes",
  "Comisión plataforma",
  "Comisión PH",
  "Estado",
  "Código portería",
  "Acciones",
];

/**
 * El `Table` del paquete compone las clases con clsx, no con tailwind-merge, y
 * ya trae `bg-transparent` por su variante `background` por defecto. Tailwind
 * ordena las utilidades alfabéticamente, así que `bg-green-50` o `bg-red-50`
 * quedan ANTES de `bg-transparent` en el CSS y la celda termina transparente
 * sobre el fondo oscuro del panel. El `!` fuerza la prioridad sin depender del
 * orden de emisión.
 */
const rowBackground = (status: string) => {
  if (status === "PAID") return "!bg-green-50 text-gray-900";
  if (status === "CANCELLED") return "!bg-red-50 text-gray-900";
  return "!bg-white text-gray-900";
};

function StaysTable({
  stays,
  onMarkAsPaid,
  isPaying,
}: {
  stays: OwnerExternalStayResponse[];
  onMarkAsPaid: (stayId: string) => void;
  isPaying: boolean;
}) {
  const totals = stays.reduce(
    (acc, stay) => ({
      platformFee: acc.platformFee + Number(stay.platformFee ?? 0),
      phFee: acc.phFee + Number(stay.phFee ?? 0),
    }),
    { platformFee: 0, phFee: 0 },
  );

  if (stays.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <MessageNotData />
      </div>
    );
  }

  const rows = stays.map((stay) => [
    `${stay.holliday?.codigo || ""} | ${stay.holliday?.name || ""}`,
    platformLabel[stay.externalListing?.platform] ||
      stay.externalListing?.platform ||
      "",
    `${stay.guestName} | ${stay.guestEmail}`,
    `${stay.startDate} - ${stay.endDate}`,
    String(stay.guestsCount),
    money(stay.platformFee),
    money(stay.phFee),
    statusLabel[stay.status] || stay.status,
    stay.guestAccess?.accessCode || "-",

    <div
      className="flex gap-2 justify-center items-center"
      key={`actions-${stay.id}`}
    >
      {stay.status === "PENDING" && (
        <Tooltip
          className="bg-gray-200 w-24"
          position="top"
          content="Marcar como pagada"
        >
          <Buton
            size="xs"
            borderWidth="none"
            rounded="lg"
            disabled={isPaying}
            onClick={() => onMarkAsPaid(stay.id)}
          >
            <MdPaid color="green" size={20} />
          </Buton>
        </Tooltip>
      )}
    </div>,
  ]);

  const cellClasses = stays.map((stay) =>
    headers.map(() => rowBackground(stay.status)),
  );

  return (
    <>
      <Table
        headers={headers}
        rows={rows}
        borderColor="text-gray-500"
        cellClasses={cellClasses}
        columnWidths={[
          "14%",
          "8%",
          "16%",
          "12%",
          "6%",
          "11%",
          "9%",
          "8%",
          "10%",
          "6%",
        ]}
      />

      <div className="flex gap-6 justify-end mt-2">
        <Text size="sm" className="text-gray-400">
          Comisión plataforma: {money(totals.platformFee)}
        </Text>
        <Text size="sm" className="text-gray-400">
          Comisión PH: {money(totals.phFee)}
        </Text>
      </div>
    </>
  );
}

export default function AllExternal() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const { data, isLoading, error } = useMyExternalStays();
  const markAsPaid = useMarkOwnerStayAsPaidMutation();

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.allexternal);
  };

  const searched = useMemo(() => {
    const term = filterText.toLowerCase();
    if (!term) return data || [];

    return (data || []).filter((stay) =>
      [
        stay.holliday?.codigo,
        stay.holliday?.name,
        stay.guestName,
        stay.guestEmail,
        platformLabel[stay.externalListing?.platform] ||
          stay.externalListing?.platform,
        stay.guestAccess?.accessCode,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [data, filterText]);

  const tabs = statusFilters.map((status) => ({
    tKey: status === "ALL" ? "Todas" : statusLabel[status],
    background: "primary",
    children: (
      <StaysTable
        stays={
          status === "ALL"
            ? searched
            : searched.filter((stay) => stay.status === status)
        }
        onMarkAsPaid={(stayId) => markAsPaid.mutate(stayId)}
        isPaying={markAsPaid.isPending}
      />
    ),
  }));

  return (
    <div key={language} className="w-full p-4">
      <HeaderAction
        title="Reservas externas registradas"
        tooltip="Registro y conección de plataforma externa"
        onClick={handleNavigate}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <CiViewTable color="white" size={34} />
          )
        }
        iconc={
          <div className="cursor-pointer">
            <FaCogs color="white" size={22} />
          </div>
        }
        idicative="Registros externos a plataforma externa"
      />

      {!conjuntoId && (
        <Text size="sm" className="text-gray-400 mt-4">
          Selecciona un conjunto para ver tus reservas externas.
        </Text>
      )}

      {conjuntoId && isLoading && (
        <div className="flex justify-center items-center h-96">
          <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
        </div>
      )}

      {conjuntoId && !isLoading && error && (
        <Text size="sm" className="text-red-500 mt-4">
          No se pudieron cargar las reservas externas.
        </Text>
      )}

      {conjuntoId && !isLoading && !error && (
        <>
          <InputField
            regexType="safeChars"
            placeholder="Buscar"
            helpText="Buscar por unidad, huésped, plataforma o código"
            value={filterText}
            prefixElement={<IoSearchCircle />}
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            onChange={(e) => setFilterText(e.target.value)}
            className="mt-2 mb-3"
          />

          <Tabs defaultActiveIndex={0} tabs={tabs} />
        </>
      )}
    </div>
  );
}
