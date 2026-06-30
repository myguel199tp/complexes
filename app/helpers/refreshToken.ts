import nookies from "nookies";

type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
};

export async function refreshAuthToken(): Promise<string> {
  const cookies = nookies.get(null);

  const sessionId = cookies.sessionId;
  const refreshToken = cookies.refreshToken;

  // ❌ No hay sesión válida
  if (!sessionId || !refreshToken) {
    nookies.destroy(null, "accessToken");
    nookies.destroy(null, "refreshToken");
    nookies.destroy(null, "sessionId");

    throw new Error("SESSION_EXPIRED");
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        refreshToken,
      }),
    });

    // ❌ Refresh inválido
    if (res.status === 401) {
      nookies.destroy(null, "accessToken");
      nookies.destroy(null, "refreshToken");
      nookies.destroy(null, "sessionId");

      throw new Error("SESSION_EXPIRED");
    }

    // ❌ Otro error temporal
    if (!res.ok) {
      throw new Error("REFRESH_FAILED");
    }

    const data: RefreshResponse = await res.json();

    // 🔐 Nuevo access token
    nookies.set(null, "accessToken", data.accessToken, {
      maxAge: 2 * 60 * 60, // 2 horas
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // 🔁 Nuevo refresh token (si backend rota)
    if (data.refreshToken) {
      nookies.set(null, "refreshToken", data.refreshToken, {
        maxAge: 90 * 24 * 60 * 60, // 90 días
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    return data.accessToken;
  } catch (error) {
    console.error("❌ REFRESH TOKEN ERROR:", error);

    throw error;
  }
}
