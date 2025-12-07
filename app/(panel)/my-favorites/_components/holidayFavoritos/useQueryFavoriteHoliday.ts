import { useQuery } from "@tanstack/react-query";
import { HolidayFavoriteService } from "../../services/hollidayFavoriteServices";

export default function useQueryFavoriteHoliday() {
  const QUERY_FAVORITE_HOLIDAY = "query_favorite_holiday";

  return useQuery({
    queryKey: [QUERY_FAVORITE_HOLIDAY],
    queryFn: () => HolidayFavoriteService(),

    staleTime: 1000 * 5,
  });
}
