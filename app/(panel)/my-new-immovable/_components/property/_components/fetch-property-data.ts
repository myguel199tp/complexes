"use client";
import { useEffect, useState } from "react";
import { parkingResponses } from "../services/response/parkingResponse";
import { propertyTipesService } from "../services/propertyTipesService";

export function usePropertyData() {
  const [data, setData] = useState<parkingResponses[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await propertyTipesService();
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
