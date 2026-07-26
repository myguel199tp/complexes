/**
 * El borrado de cookies ya no puede hacerse desde el navegador: son httpOnly.
 * /api/auth/logout invalida la sesión en el backend y expira las tres cookies
 * en la misma respuesta.
 */
export const logout = async () => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {
    // Si falla la red, el middleware seguirá rechazando la sesión al expirar.
  }
};
