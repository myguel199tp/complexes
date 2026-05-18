import { useEffect, useState } from "react";
import { Visit } from "./response/visit";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export function useVisitSummary(visitId: string, conjuntoId: string) {
  const [data, setData] = useState<Visit>(null);

  useEffect(() => {
    if (!visitId) return;

    const interval = setInterval(async () => {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/visit/${visitId}/summary`,
        {
          headers: {
            "x-conjunto-id": conjuntoId,
          },
        },
      );

      const json = await res.json();
      setData(json);
    }, 1000);

    return () => clearInterval(interval);
  }, [visitId, conjuntoId]);

  return data;
}
