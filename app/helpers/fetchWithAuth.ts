import nookies from "nookies";
import { refreshAuthToken } from "./refreshToken";

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const cookies = nookies.get(null);
  let accessToken = cookies.accessToken;

  const makeRequest = (token: string) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

  let res = await makeRequest(accessToken);

  if (res.status === 401 || res.status === 403) {
    try {
      // 🔒 evita múltiples refresh simultáneos
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

      // 🧹 limpiar sesión completa
      nookies.destroy(null, "accessToken");
      nookies.destroy(null, "refreshToken");
      nookies.destroy(null, "sessionId");

      throw new Error("SESSION_EXPIRED");
    }
  }

  return res;
}
