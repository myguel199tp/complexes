import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getReferralsByUser(userId: string) {
  const res = await fetchWithAuth(`${API_URL}/api/referrals/user/${userId}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Error al obtener referidos");
  }

  return res.json();
}

export async function getReferralsByConjunto(conjuntoId: string) {
  const res = await fetchWithAuth(
    `${API_URL}/referrals/conjunto/${conjuntoId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Error al obtener referidos");
  }

  return res.json();
}

export async function getMe(conjuntoId: string) {
  const res = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Error al obtener usuario");
  }

  return res.json();
}
