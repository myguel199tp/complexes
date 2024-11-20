"use client";
import { useEffect, useState } from "react";
import { parkingService } from "../services/parkingService";
import { parkingResponses } from "../services/response/parkingResponse";

export function useParkingData() {
  const [data, setData] = useState<parkingResponses[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await parkingService();
        setData(response);
      } catch (err) {
        setError(`Error al encontrar la información: ${err}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
