"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { allCertificationService } from "../services/certificationAllServices";
import { t } from "i18next";

export default function useCertificationInfo() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const { data = [], error } = useQuery({
    queryKey: ["certifications", conjuntoId],
    queryFn: () => allCertificationService(conjuntoId!),
    enabled: !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    data,
    error: error instanceof Error ? error.message : error ? t("errorDesconocido") : null,
    conjuntoId,
    BASE_URL,
    t,
  };
}
