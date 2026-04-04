"use client";

import { useQuery } from "@tanstack/react-query";
import { FeePaymentsService } from "../services/feePaymentsService";

const QUERY_KEY = "fee_payments";

export const useFeePaymentsQuery = (conjuntoId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, conjuntoId],
    queryFn: () => FeePaymentsService.getPayments(conjuntoId),
    enabled: !!conjuntoId,
  });
};
