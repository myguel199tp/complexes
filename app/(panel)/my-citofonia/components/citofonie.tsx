"use client";
import React, { useState } from "react";
import Form from "./formulario/form";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";
import { Text } from "complexes-next-components";
import { useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useVisitSocket } from "../hooks/useVisitSocket";
import { useSidebarInformation } from "@/app/components/ui/sidebar-information";
import Link from "next/link";
import {
  MdCarRental,
  MdChevronRight,
  MdDirectionsRun,
  MdInventory2,
  MdLocalParking,
  MdQrCodeScanner,
} from "react-icons/md";

type QuickLinkTone = "primary" | "danger";

interface QuickLinkItem {
  href: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  tone?: QuickLinkTone;
}

const QUICK_LINKS: QuickLinkItem[] = [
  // Pantalla única: pases de residente, huéspedes y domicilios.
  {
    href: route.myDeliveryAccess,
    label: "Validar acceso con QR",
    hint: "Residentes, huéspedes y domicilios",
    icon: <MdQrCodeScanner size={20} />,
  },
  {
    href: route.myParcels,
    label: "Paquetes",
    hint: "Recibir y entregar encomiendas",
    icon: <MdInventory2 size={20} />,
  },
  {
    href: route.myParking,
    label: "Zona de parqueo",
    hint: "Celdas y cupos de visitantes",
    icon: <MdLocalParking size={20} />,
  },
  /*
    Va junto a "Zona de parqueo" y no dentro de ella porque son dos
    preguntas distintas: allá se ve qué celdas existen, aquí quién
    tiene arrendada cuál. Una celda arrendada está ocupada todos los
    días sin pertenecer a ningún apartamento, y hasta ahora el
    inventario la mostraba libre.
  */
  {
    href: route.myParkingRentals,
    label: "Parqueaderos en alquiler",
    hint: "Quién tiene arrendada cada celda",
    icon: <MdCarRental size={20} />,
  },
  {
    href: route.myEvacuation,
    label: "Lista de evacuación",
    hint: "Quién está dentro ahora mismo",
    icon: <MdDirectionsRun size={20} />,
    tone: "danger",
  },
];

const QUICK_LINK_TONES: Record<
  QuickLinkTone,
  { card: string; icon: string; arrow: string }
> = {
  primary: {
    // Nada de `border-white/*` (ni con `dark:`): globals.css lo reescribe en
    // claro por coincidencia de texto y se comería el borde del hover.
    card: "border-slate-200 hover:border-cyan-400 focus-visible:outline-cyan-500 dark:border-slate-700/70 dark:hover:border-cyan-400/60",
    icon: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
    arrow: "group-hover:text-cyan-600 dark:group-hover:text-cyan-300",
  },
  danger: {
    card: "border-rose-200 hover:border-rose-400 focus-visible:outline-rose-500 dark:border-rose-500/30 dark:hover:border-rose-400/70",
    icon: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
    arrow: "group-hover:text-rose-600 dark:group-hover:text-rose-300",
  },
};

function QuickLink({
  item,
  pending,
  onNavigate,
}: {
  item: QuickLinkItem;
  pending: boolean;
  onNavigate: (href: string) => void;
}) {
  const tone = QUICK_LINK_TONES[item.tone ?? "primary"];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Ctrl/Cmd/Shift o clic central abren otra pestaña: aquí no hay carga.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    onNavigate(item.href);
  };

  return (
    <Link
      href={item.href}
      onClick={handleClick}
      aria-busy={pending || undefined}
      className={`group flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5 shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-0 dark:bg-white/5 dark:hover:bg-white/10 ${tone.card}`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}
      >
        {item.icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-tight text-slate-800 dark:text-slate-100">
          {item.label}
        </span>
        <span className="mt-0.5 hidden text-xs leading-snug text-slate-500 dark:text-slate-400 sm:block">
          {item.hint}
        </span>
      </span>

      {pending ? (
        <ImSpinner9
          className="shrink-0 animate-spin text-slate-400"
          size={16}
          aria-hidden="true"
        />
      ) : (
        <MdChevronRight
          size={20}
          aria-hidden="true"
          className={`shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 ${tone.arrow}`}
        />
      )}
    </Link>
  );
}

export default function Citofonie() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  // Acceso rápido que se está abriendo, para que el clic dé respuesta inmediata.
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);
  const { valueState } = useSidebarInformation();
  const canValidateDeliveries =
    valueState.userRolName.includes("porter") ||
    valueState.userRolName.includes("employee");

  useVisitSocket({
    onNewVisit: (visit) => {
      showAlert(`Nuevo visitante: ${visit.namevisit}`, "info");

      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.citofonia);
  };

  return (
    <div key={language}>
      <HeaderAction
        title={t("registrarVisitante")}
        tooltip={t("visitasAgregadas")}
        onClick={handleNavigate}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <CiViewTable color="white" size={34} />
          )
        }
        iconc={
          <div
            onClick={() => setShowInfo((prev) => !prev)}
            className="cursor-pointer"
          >
            <FaCogs color="white" size={22} />
          </div>
        }
        idicative={t("visitasAgregadas")}
      />

      {canValidateDeliveries && (
        <nav aria-label="Accesos de portería" className="mt-3 mb-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Accesos de portería
          </p>
          {/* Columnas según el ancho del contenedor: en móvil el sidebar resta espacio. */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] gap-2 sm:gap-3">
            {QUICK_LINKS.map((item) => (
              <QuickLink
                key={item.href}
                item={item}
                pending={pendingHref === item.href}
                onNavigate={setPendingHref}
              />
            ))}
          </div>
        </nav>
      )}

      <div className="w-full flex gap-2">
        <div className={showInfo ? "flex-1" : "w-full"}>
          <Form />
        </div>

        {showInfo && (
          <div
            className="
              flex flex-col gap-3 p-3 shadow-lg border rounded-lg
              w-full md:w-[220px]
              max-h-[300px] md:max-h-[500px]
              overflow-y-auto scrollbar-hide
              mt-2
            "
          >
            <Text colVariant="on" size="xs" font="bold">
              ¿Qué puedes hacer?
            </Text>
            <Text colVariant="on" size="xs">
              Relaciona las personas que entran al condominio
            </Text>
            <Text colVariant="on" size="xs">
              Una ves guardado se tendra la trazabilidad de todas los visitantes
              que han entrado al conjunto o unidad residencial
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
