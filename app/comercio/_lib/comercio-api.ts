import { getComercioToken, clearComercioToken } from "./comercio-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function parseError(response: Response): Promise<string> {
  const err = await response.json().catch(() => ({}));
  if (typeof err.message === "string") return err.message;
  if (Array.isArray(err.message)) return err.message.join(", ");
  return "Ocurrió un error inesperado";
}

export async function comercioFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getComercioToken();

  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    clearComercioToken();
    if (typeof window !== "undefined") {
      window.location.href = "/comercio/login";
    }
    throw new Error("Sesión expirada");
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
