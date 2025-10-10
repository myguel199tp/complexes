import { useEffect, useState, useMemo } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { allVisitService } from "../../services/citofonieAllService";
import { VisitResponse } from "../../services/response/VisitResponse";
import { useTranslation } from "react-i18next";

export function useTableInfo() {
  const [data, setData] = useState<VisitResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");

  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const { t } = useTranslation();

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

  const headers = useMemo(
    () => [
      t("nombreVisistante"),
      t("numeroInmuebleResidencial"),
      t("numeroPlaca"),
      t("tipovisitante"),
      t("horaIngreso"),
    ],
    [t]
  );

  const filteredRows = useMemo(() => {
    const filterLower = filterText.toLowerCase();

    return data
      .filter((user) => {
        return (
          user.namevisit?.toLowerCase().includes(filterLower) ||
          user.apartment?.toLowerCase().includes(filterLower) ||
          user.plaque?.toLowerCase().includes(filterLower) ||
          user.visitType?.toLowerCase().includes(filterLower) ||
          user.created_at?.toLowerCase().includes(filterLower)
        );
      })
      .map((user) => [
        user.namevisit || "",
        user.apartment || "",
        user.plaque || "",
        user.visitType || "",
        user.created_at
          ? new Date(user.created_at).toLocaleString("es-CO", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
          : "",
      ]);
  }, [data, filterText]);

  return {
    data,
    error,
    headers,
    filteredRows,
    filterText,
    setFilterText,
    t,
  };
}
