/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { useEffect, useState } from "react";
import { PricingResponse } from "../../services/response/pricingREsponse";
import { pricingService } from "../../services/pricingService";

export function infoPayments(
  country: string,
  apartments: number,
  billing: string
) {
  const [data, setData] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apartments || apartments < 10) {
      setData(null);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const response: PricingResponse = await pricingService(
          country,
          apartments,
          billing
        );
        setData(response);
      } catch (err) {
        const errorObj = err as Error; // 👈 cast explícito
        setError(`Error al encontrar la información: ${errorObj.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [country, apartments, billing]);

  return { data, loading, error };
}
