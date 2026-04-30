"use client";

import { useQuery } from "@tanstack/react-query";
import { FeePaymentsService } from "../services/feePaymentsService";

const QUERY_KEY_BANKS = "query_key_banks";

export const useBanksQuery = (conjuntoId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY_BANKS, conjuntoId],
    queryFn: () => FeePaymentsService.getPayments(conjuntoId),
    enabled: !!conjuntoId,
  });
};
