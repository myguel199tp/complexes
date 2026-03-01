import { useQuery } from "@tanstack/react-query";
import { HolidayFavoriteService } from "../../services/hollidayFavoriteServices";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export default function useQueryFavoriteHoliday() {
  const QUERY_FAVORITE_HOLIDAY = "query_favorite_holiday";
  const storedUserId = useConjuntoStore((state) => state.userId);

  return useQuery({
    queryKey: [QUERY_FAVORITE_HOLIDAY],
    queryFn: () => HolidayFavoriteService(storedUserId),
  });
}
