"use client";
import { useEffect, useState } from "react";
import { antiquityService } from "../services/antiquitySercive";
import { antiquityResponses } from "../services/response/antiquityResponse";

export function useAntiquityData() {
  const [data, setData] = useState<antiquityResponses[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await antiquityService();
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
