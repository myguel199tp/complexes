import { useEffect, useState } from "react";
import { SocialResponse } from "../services/response/socialResponse";
import { allReservationService } from "../services/mySocialRegisterService";

export default function ReservationInfo() {
  const [data, setData] = useState<SocialResponse[]>();
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await allReservationService();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    fetchData();
  }, []);

  return {
    BASE_URL,
    data,
    error,
  };
}
