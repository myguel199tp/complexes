import { useEffect, useState } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { t } from "i18next";
import { AllPqrInfoService } from "../services/pqrinfoServices";
import { PqrResponse } from "../services/response/pqrResponse";

export default function usePqrInfo() {
  const [data, setData] = useState<PqrResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const storedUserId = useConjuntoStore((state) => state.userId);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      if (!conjuntoId || !storedUserId) {
        console.warn("⏸ No hay conjuntoId o userId aún, deteniendo fetch.");
        return;
      }
      try {
        const result = await AllPqrInfoService(storedUserId, conjuntoId);
        setData(result);
      } catch (err) {
        console.error("❌ Error al obtener PQR info:", err);
        setError(err instanceof Error ? err.message : t("errorDesconocido"));
      }
    };

    fetchData();
  }, [conjuntoId, storedUserId]);

  return { data, error, conjuntoId, BASE_URL, t };
}
