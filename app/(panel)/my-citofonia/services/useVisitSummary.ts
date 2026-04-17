import { useEffect, useState } from "react";
import { Visit } from "./response/visit";

export function useVisitSummary(visitId: string, conjuntoId: string) {
  const [data, setData] = useState<Visit>(null);

  useEffect(() => {
    if (!visitId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/cito/summary/${visitId}`, {
        headers: {
          "x-conjunto-id": conjuntoId,
        },
      });

      const json = await res.json();
      setData(json);
    }, 1000); // 🔥 cada segundo

    return () => clearInterval(interval);
  }, [visitId, conjuntoId]);

  return data;
}
