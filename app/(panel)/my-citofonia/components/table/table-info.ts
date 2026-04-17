import { useEffect, useState, useMemo } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { allVisitService } from "../../services/citofonieAllService";
import { VisitResponse } from "../../services/response/VisitResponse";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export function useTableInfo() {
  const [data, setData] = useState<VisitResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");

  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const { t } = useTranslation();
  const { language } = useLanguage();

  // 🔥 traer datos
  useEffect(() => {
    if (!conjuntoId) return;

    const fetchData = async () => {
      try {
        const result = await allVisitService(conjuntoId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    fetchData();
  }, [conjuntoId]);

  // 🔥 refrescar cada segundo (tiempo en vivo)
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => [...prev]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ⏱️ calcular duración
  function getDuration(visit: VisitResponse) {
    if (!visit.entryTime) return 0;

    const end = visit.exitTime ? new Date(visit.exitTime) : new Date();
    const start = new Date(visit.entryTime);

    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  }

  // 💰 calcular costo
  function getCost(visit: VisitResponse) {
    if (!visit.hasParking || !visit.entryTime) return 0;

    const end = visit.exitTime ? new Date(visit.exitTime) : new Date();
    const start = new Date(visit.entryTime);

    const hours = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60),
    );

    return hours * (visit.parkingRatePerHour || 0);
  }

  // ⏱️ formatear tiempo bonito
  function formatTime(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  // 🧾 headers
  const headers = useMemo(
    () => [
      t("nombreVisistante"),
      t("numeroInmuebleResidencial"),
      t("numeroPlaca"),
      t("tipovisitante"),
      "Tiempo",
      "Costo",
    ],
    [t],
  );

  // 🔍 filtro + filas
  const filteredRows = useMemo(() => {
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
        ];
      });
  }, [data, filterText]);

  return {
    data,
    error,
    headers,
    filteredRows,
    filterText,
    setFilterText,
    t,
    language,
  };
}
