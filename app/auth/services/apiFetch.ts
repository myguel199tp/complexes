import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export async function apiFetch(url: string, options: RequestInit = {}) {
  return fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });
}
