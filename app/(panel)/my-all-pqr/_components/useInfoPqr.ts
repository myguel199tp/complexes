import { useEffect, useState } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { t } from "i18next";
import { AllPqrResponse } from "../services/response/AllPqrResponse";
import { AllPqrService } from "../services/pqrAllServices";

export default function useInfoPqr() {
  const [data, setData] = useState<AllPqrResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      if (!conjuntoId) {
        console.warn("⏸ No hay conjuntoId o userId aún, deteniendo fetch.");
        return;
      }

      console.log("🚀 Fetching PQR info:", {
        conjuntoId,
        url: `${BASE_URL}/api/pericionesqr/register-qr/${conjuntoId}}`,
      });

      try {
        const result = await AllPqrService(conjuntoId);
        setData(result);
      } catch (err) {
        console.error("❌ Error al obtener PQR info:", err);
        setError(err instanceof Error ? err.message : t("errorDesconocido"));
      }
    };

    fetchData();
  }, [conjuntoId]);

  return { data, error, conjuntoId, BASE_URL, t };
}
