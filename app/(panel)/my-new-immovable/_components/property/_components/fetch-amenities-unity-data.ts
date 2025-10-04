"use client";
import { useEffect, useState } from "react";
import { amenitiesUnityService } from "../services/amenitiesUnityService";
import { amenitiesUnityResponse } from "../services/response/amenitiesUnityResponse";

export function useAmenityUnityData() {
  const [data, setData] = useState<amenitiesUnityResponse[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await amenitiesUnityService();
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
