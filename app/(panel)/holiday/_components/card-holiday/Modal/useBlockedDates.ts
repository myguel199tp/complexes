import { useQuery } from "@tanstack/react-query";
import { getBlockedDates } from "../../../services/holidayAvailabilityService";

export function useBlockedDates(holidayId: string) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["blocked-dates", holidayId],
    queryFn: () => getBlockedDates(holidayId),
    enabled: !!holidayId,
    staleTime: 1000 * 60 * 5,
  });

  // Parse "YYYY-MM-DD" strings without timezone offset
  const disabledDates = data.map((d) => {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day);
  });

  return { disabledDates, isLoading };
}
