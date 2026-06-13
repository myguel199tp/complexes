"use client";

import { useEffect, useRef } from "react";
import { parseCookies } from "nookies";
import { refreshAuthToken } from "@/app/helpers/refreshToken";

const REFRESH_MARGIN_MS = 10 * 60 * 1000; // refrescar 10 min antes de expirar

function getAccessTokenExpiry(): number | null {
  try {
    const { accessToken } = parseCookies();
    if (!accessToken) return null;
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    return payload?.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function SessionRefresher() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = (expiresAt: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const msUntilRefresh = expiresAt - Date.now() - REFRESH_MARGIN_MS;

    if (msUntilRefresh <= 0) {
      doRefresh();
      return;
    }

    timerRef.current = setTimeout(doRefresh, msUntilRefresh);
  };

  const doRefresh = async () => {
    const { refreshToken } = parseCookies();
    if (!refreshToken) return;

    try {
      await refreshAuthToken();
      const expiry = getAccessTokenExpiry();
      if (expiry) scheduleRefresh(expiry);
    } catch {
      // refresh fallido: el middleware/fetchWithAuth maneja la redirección
    }
  };

  useEffect(() => {
    const { refreshToken } = parseCookies();
    if (!refreshToken) return;

    const expiry = getAccessTokenExpiry();

    if (!expiry || Date.now() >= expiry - REFRESH_MARGIN_MS) {
      // token ausente o por vencer → refrescar ya
      doRefresh();
    } else {
      scheduleRefresh(expiry);
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        const exp = getAccessTokenExpiry();
        if (!exp || Date.now() >= exp - REFRESH_MARGIN_MS) {
          doRefresh();
        }
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
