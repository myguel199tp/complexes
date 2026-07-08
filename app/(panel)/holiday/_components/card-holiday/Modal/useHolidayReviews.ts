"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getHolidayReviews,
  getHolidayAverageRating,
  HolidayReview,
} from "../../../services/reviewsHolidayService";

export function useHolidayReviews(hollidayId: string, enabled: boolean) {
  const reviews = useQuery<HolidayReview[]>({
    queryKey: ["holiday-reviews", hollidayId],
    queryFn: () => getHolidayReviews(hollidayId),
    enabled: enabled && !!hollidayId,
    refetchOnWindowFocus: false,
  });

  const average = useQuery<number>({
    queryKey: ["holiday-reviews-average", hollidayId],
    queryFn: () => getHolidayAverageRating(hollidayId),
    enabled: enabled && !!hollidayId,
    refetchOnWindowFocus: false,
  });

  return { reviews, average };
}
