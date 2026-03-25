import { parseCookies } from "nookies";

export async function apiFetch(url: string, options: RequestInit = {}) {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
    credentials: "include",
  });
}
