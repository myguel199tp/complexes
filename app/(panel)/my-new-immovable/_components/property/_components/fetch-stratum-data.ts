"use client";
import { useEffect, useState } from "react";
import { parkingResponses } from "../services/response/parkingResponse";
import { stratumService } from "../services/stratumService";

export function useStratumData() {
  const [data, setData] = useState<parkingResponses[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await stratumService();
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
