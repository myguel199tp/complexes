"use client";
import { useEffect, useState } from "react";
import { restroomResponses } from "../services/response/restroomResponse";
import { restroomService } from "../services/restroomService";

export function useRestroomData() {
  const [data, setData] = useState<restroomResponses[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await restroomService();
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
