import { useEffect, useState } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { t } from "i18next";
import { AllPqrInfoService } from "../services/pqrinfoServices";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { PqrResponse } from "../services/response/pqrResponse";

export default function usePqrInfo() {
  const [data, setData] = useState<PqrResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const payload = getTokenPayload();
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      if (!conjuntoId || !storedUserId) {
        console.warn("⏸ No hay conjuntoId o userId aún, deteniendo fetch.");
        return;
      }

      console.log("🚀 Fetching PQR info:", {
        conjuntoId,
        storedUserId,
        url: `${BASE_URL}/api/pericionesqr/register-qr/${conjuntoId}/${storedUserId}`,
      });

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
