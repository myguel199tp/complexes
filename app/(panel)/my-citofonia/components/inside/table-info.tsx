import { useMemo, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { VisitResponse } from "../../services/response/VisitResponse";
import { useInside } from "./use-inside-query";
import { ImExit } from "react-icons/im";

export function useTableInfo() {
  const [filterText, setFilterText] = useState("");

  const [selectedVisit, setSelectedVisit] = useState<VisitResponse | null>(
    null,
  );
  const [openModal, setOpenModal] = useState(false);

  const { t } = useTranslation();
  const { language } = useLanguage();

  const { data = [], error, isLoading } = useInside();

  function handleOpenModal(visit: VisitResponse) {
    setSelectedVisit(visit);
    setOpenModal(true);
  }

  function handleCloseModal() {
    setSelectedVisit(null);
    setOpenModal(false);
  }

  function getDuration(visit: VisitResponse) {
    if (!visit.entryTime) return 0;

    const end = visit.exitTime ? new Date(visit.exitTime) : new Date();
    const start = new Date(visit.entryTime);

    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  }

  function getCost(visit: VisitResponse) {
    if (!visit.hasParking || !visit.entryTime) return 0;

    const end = visit.exitTime ? new Date(visit.exitTime) : new Date();
    const start = new Date(visit.entryTime);

    const hours = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60),
    );

    return hours * (visit.parkingRatePerHour || 0);
  }

  function formatTime(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  const headers = useMemo(
    () => [
      t("nombreVisistante"),
      t("numeroInmuebleResidencial"),
      t("numeroPlaca"),
      t("tipovisitante"),
      "Tiempo",
      "Costo",
      "Acciones",
    ],
    [t],
  );

  // 🔥 AQUÍ ESTABA EL ERROR
  const filteredRows = useMemo<ReactNode[][]>(() => {
    const filterLower = filterText.toLowerCase();

    return data
      .filter((user) => {
        return (
          user.namevisit?.toLowerCase().includes(filterLower) ||
          user.apartment?.toLowerCase().includes(filterLower) ||
          user.plaque?.toLowerCase().includes(filterLower) ||
          user.visitType?.toLowerCase().includes(filterLower)
        );
      })
      .map((user) => {
        const duration = getDuration(user);
        const cost = getCost(user);

        return [
          user.namevisit || "",
          user.apartment || "",
          user.plaque || "",
          user.visitType || "",
          formatTime(duration),
          `$${cost.toLocaleString("es-CO")}`,

          <ImExit
            key={user.id}
            size={18}
            className="text-red-500 cursor-pointer hover:scale-110 transition"
            onClick={() => handleOpenModal(user)}
          />,
        ];
      });
  }, [data, filterText]);

  return {
    error,
    isLoading,
    headers,
    filteredRows,
    filterText,
    setFilterText,
    t,
    language,
    openModal,
    selectedVisit,
    handleCloseModal,
  };
}
