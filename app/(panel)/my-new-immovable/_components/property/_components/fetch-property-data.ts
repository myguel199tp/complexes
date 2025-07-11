"use client";
import { useEffect, useState } from "react";
import { propertyTipesService } from "../services/propertyTipesService";
import { propertyResponses } from "../services/response/propertyTipesResponse";

export function usePropertyData() {
  const [data, setData] = useState<propertyResponses[] | null>(null);
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
