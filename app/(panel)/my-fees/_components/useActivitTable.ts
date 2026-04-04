"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFeePaymentsQuery } from "./use-fee-payments-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export default function useFeePaymentsTable() {
  const queryClient = useQueryClient();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const { data = [], error } = useFeePaymentsQuery(conjuntoId);

  const [filterText, setFilterText] = useState("");

  const QUERY_KEY = "fee_payments";

  return {
    data,
    error,
    filterText,
    setFilterText,
    queryClient,
    QUERY_KEY,
  };
}
