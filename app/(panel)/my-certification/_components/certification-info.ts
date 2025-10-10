import { useEffect, useState } from "react";
import { CertificationResponse } from "../services/response/certificationResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { allCertificationService } from "../services/certificationAllServices";
import { t } from "i18next";

export default function useCertificationInfo() {
  const [data, setData] = useState<CertificationResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      if (!conjuntoId) return;
      try {
        const result = await allCertificationService(conjuntoId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errorDesconocido"));
      }
    };
    fetchData();
  }, [conjuntoId]);
  return {
    data,
    error,
    conjuntoId,
    BASE_URL,
    t,
  };
}
