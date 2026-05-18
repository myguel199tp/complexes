import nookies from "nookies";

type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
  sessionId?: string; // 👈 importante si tu backend rota sesión
};

export async function refreshAuthToken(): Promise<string> {
  const cookies = nookies.get(null);

  const sessionId = cookies.sessionId;
  const refreshToken = cookies.refreshToken;

  // ❌ sin sesión = limpiar TODO
  if (!sessionId || !refreshToken) {
    nookies.destroy(null, "accessToken");
    nookies.destroy(null, "refreshToken");
    nookies.destroy(null, "sessionId");

    throw new Error("SESSION_EXPIRED");
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId,
      refreshToken,
    }),
  });

  if (!res.ok) {
    // ❌ si refresh falla, también limpias sesión
    nookies.destroy(null, "accessToken");
    nookies.destroy(null, "refreshToken");
    nookies.destroy(null, "sessionId");

    throw new Error("SESSION_EXPIRED");
  }

  const data: RefreshResponse = await res.json();

  // 🔐 access token nuevo
  nookies.set(null, "accessToken", data.accessToken, {
    maxAge: 15 * 60,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // 🔁 refresh token rotado (si backend lo devuelve)
  if (data.refreshToken) {
    nookies.set(null, "refreshToken", data.refreshToken, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  // 🧠 sessionId SOLO si tu backend lo rota
  if (data.sessionId) {
    nookies.set(null, "sessionId", data.sessionId, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return data.accessToken;
}
