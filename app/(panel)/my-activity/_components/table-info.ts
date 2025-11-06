import { useEffect, useState } from "react";
import { ActivityResponse } from "../services/response/activityResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useTranslation } from "react-i18next";
import { allActivityService } from "../services/activityAllServices";

export default function useTableInfo() {
  const [data, setData] = useState<ActivityResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      if (!infoConjunto) return;
      try {
        const result = await allActivityService(infoConjunto);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errorDesconocido"));
      }
    };
    fetchData();
  }, [infoConjunto, t]);

  return {
    data,
    setData, // <--- AGREGADO
    error,
    filterText,
    setFilterText,
    t,
  };
}
