import { useEffect, useState } from "react";
import { SocialResponse } from "../services/response/socialResponse";
import { allReservationService } from "../services/mySocialRegisterService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export default function ReservationInfo() {
  const [data, setData] = useState<SocialResponse[]>();
  const [error, setError] = useState<string | null>(null);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      if (!conjuntoId) return;

      try {
        const result = await allReservationService(conjuntoId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    fetchData();
  }, [conjuntoId]);

  return {
    BASE_URL,
    data,
    error,
  };
}
