export function decodeJWT(token: string | undefined) {
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // En el navegador no hay Buffer (Next no lo incluye en el bundle).
    const jsonPayload =
      typeof window === "undefined"
        ? Buffer.from(base64, "base64").toString("utf8")
        : decodeURIComponent(
            Array.from(
              atob(base64),
              (c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`,
            ).join(""),
          );

    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Error decoding token", err);
    return null;
  }
}
