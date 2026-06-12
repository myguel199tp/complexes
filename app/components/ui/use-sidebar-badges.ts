"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { AllPqrService } from "@/app/(panel)/my-all-pqr/services/pqrAllServices";
import { AllPqrResponse } from "@/app/(panel)/my-all-pqr/services/response/AllPqrResponse";
import { AllPqrInfoService } from "@/app/(panel)/my-pqr/services/pqrinfoServices";
import { PqrResponse } from "@/app/(panel)/my-pqr/services/response/pqrResponse";
import {
  getMyFeesService,
  MyFeesResponse,
} from "@/app/(panel)/my-vip/services/myVipFeesService";
import { route } from "@/app/_domain/constants/routes";

const PQR_ROUTES = [route.mypqr, route.myAllPqr];
const FEES_ROUTES = [route.myvip, route.myfees];

export function useSidebarBadges(menuRoutes: string[]) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const pathname = usePathname();

  const isAllPqrMenu = menuRoutes.includes(route.myAllPqr);
  const hasPqrMenu = menuRoutes.some((r) => PQR_ROUTES.includes(r));
  const hasFeesMenu = menuRoutes.some((r) => FEES_ROUTES.includes(r));
  const isPqrRoute = PQR_ROUTES.some((r) => pathname.startsWith(r));

  const localKey = `pqr-seen-${conjuntoId}`;

  const [seenCount, setSeenCount] = useState<number>(0);

  // Initialize seenCount from localStorage once conjuntoId is available
  useEffect(() => {
    if (conjuntoId) {
      setSeenCount(
        parseInt(localStorage.getItem(localKey) ?? "0", 10),
      );
    }
  }, [conjuntoId, localKey]);

  const { data: pqrData } = useQuery<AllPqrResponse[] | PqrResponse[]>({
    queryKey: ["sidebar-pqr", conjuntoId, isAllPqrMenu],
    queryFn: () =>
      isAllPqrMenu
        ? AllPqrService(String(conjuntoId))
        : AllPqrInfoService(String(conjuntoId)),
    enabled: !!conjuntoId && hasPqrMenu,
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: false,
  });

  const { data: feesData } = useQuery<MyFeesResponse>({
    queryKey: ["sidebar-fees", conjuntoId],
    queryFn: () => getMyFeesService(String(conjuntoId)),
    enabled: !!conjuntoId && hasFeesMenu,
    staleTime: 60_000,
    retry: false,
  });

  // When user visits the PQR route, mark all current PQRs as seen
  useEffect(() => {
    if (isPqrRoute && pqrData) {
      localStorage.setItem(localKey, String(pqrData.length));
      setSeenCount(pqrData.length);
    }
  }, [isPqrRoute, pqrData, localKey]);

  const pqrUnread = useMemo(() => {
    if (!pqrData) return 0;
    return Math.max(0, pqrData.length - seenCount);
  }, [pqrData, seenCount]);

  const nextPaymentDays = useMemo(() => {
    const pending = feesData?.pending ?? [];
    if (!pending.length) return null;
    const now = Date.now();
    const nextDue = pending
      .map((f) => new Date(f.dueDate).getTime())
      .filter((d) => d > now)
      .sort((a, b) => a - b)[0];
    if (nextDue === undefined) return null;
    return Math.ceil((nextDue - now) / (1000 * 60 * 60 * 24));
  }, [feesData]);

  return { pqrUnread, nextPaymentDays };
}
