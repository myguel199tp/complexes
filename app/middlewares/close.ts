import { destroyCookie, parseCookies } from "nookies";

export const logout = async () => {
  const { accessToken, sessionId } = parseCookies();

  // Invalidar la sesión en el servidor. Sin esto la fila de `user_sessions`
  // queda `isActive: true` y el refreshToken puede resucitar la sesión.
  if (accessToken && sessionId) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ sessionId }),
      });
    } catch {
      // Si falla la red igual limpiamos las cookies locales.
    }
  }

  // Las tres cookies que crea el login: si queda `refreshToken`, el
  // SessionRefresher vuelve a pedir un accessToken al entrar y el usuario
  // aparece logueado otra vez.
  destroyCookie(null, "accessToken", { path: "/" });
  destroyCookie(null, "refreshToken", { path: "/" });
  destroyCookie(null, "sessionId", { path: "/" });
};
