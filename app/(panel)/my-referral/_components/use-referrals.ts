"use client";

import { useQuery } from "@tanstack/react-query";
import { getReferralsByUser } from "../services/referralService";

export function useReferrals(userId?: string) {
  return useQuery({
    queryKey: ["referrals", userId],
    queryFn: () => getReferralsByUser(userId!),
    enabled: !!userId, // ⬅️ clave
  });
}
