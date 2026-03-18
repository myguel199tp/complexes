"use client";

import { useQuery } from "@tanstack/react-query";
import { Filters, HollidaysService } from "../services/hollidayService";

interface QueryProps {
  filters: Filters;
  page: number;
}

const QUERY_HOLIDAY = "query_holiday";

export function useQueryHoliday({ filters, page }: QueryProps) {
  return useQuery({
    queryKey: [QUERY_HOLIDAY, filters, page],
    queryFn: () =>
      HollidaysService({
        filters,
        page,
        limit: 24,
      }),

    keepPreviousData: true, 
    staleTime: 1000 * 5,
  });
}
