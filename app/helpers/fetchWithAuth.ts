import nookies from "nookies";
import { refreshAuthToken } from "./refreshToken";

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const cookies = nookies.get(null);

  let accessToken = cookies.accessToken;

  // ✅ evitar Bearer undefined
  if (!accessToken) {
    throw new Error("SESSION_EXPIRED");
  }

  const makeRequest = (token?: string) =>
    fetch(url, {
      cache: "no-store",
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    });

  let res = await makeRequest(accessToken);

  // ✅ SOLO refresh en 401
  if (res.status === 401) {
    try {
      if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise = refreshAuthToken().finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
      }

      accessToken = await refreshPromise;

      res = await makeRequest(accessToken);
    } catch (error) {
      console.error("Refresh failed:", error);

      nookies.destroy(null, "accessToken");
      nookies.destroy(null, "refreshToken");
      nookies.destroy(null, "sessionId");

      throw new Error("SESSION_EXPIRED");
    }
  }

  // ✅ plan vencido
  if (res.status === 403) {
    throw new Error("PLAN_EXPIRED");
  }

  return res;
}
