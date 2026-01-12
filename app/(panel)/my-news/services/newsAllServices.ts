import { parseCookies } from "nookies";
import { NewsResponse } from "./response/newsResponse";

export async function allNewsService(
  conjuntoId: string
): Promise<NewsResponse[]> {
  // 🔹 1️⃣ Revisar cookies
  const cookies = parseCookies();
  console.log("Cookies leídas:", cookies);

  const token = cookies.accessToken;
  console.log("Token extraído de cookie:", token);

  if (!token) {
    throw new Error("No se encontró token de autenticación.");
  }

  // 🔹 2️⃣ Revisar URL y headers antes de fetch
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/new-admin/allNews/${conjuntoId}`;
  console.log("Fetch URL:", url);
  console.log("Headers:", {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // 🔹 Si tu cookie es httpOnly, necesitas esto para que se envíe
    credentials: "include",
  });

  console.log("Response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.log("Response error text:", errorText);
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log("Datos recibidos:", data);
  return data;
}
