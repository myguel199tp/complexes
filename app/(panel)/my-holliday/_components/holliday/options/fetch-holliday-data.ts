"use client";
import { useEffect, useState } from "react";
import { propertyHollidayResponse } from "../../../services/response/propertyHollidayResponse";
import { hollidayPropertyService } from "../../../services/hollidayPropertyService";

export function usePropertyHollidayData() {
  const [data, setData] = useState<propertyHollidayResponse[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await hollidayPropertyService();
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
