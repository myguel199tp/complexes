import { parseCookies } from "nookies";

// app/(dashboard)/referrals/services/referral.service.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function getReferralsByUser(userId: string) {
  const cookies = parseCookies();
  const token = cookies.accessToken;
  const res = await fetch(`${API_URL}/api/referrals/user/${userId}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Error al obtener referidos");
  }

  return res.json();
}

export async function getReferralsByConjunto(conjuntoId: string) {
  const cookies = parseCookies();
  const token = cookies.accessToken;
  const res = await fetch(`${API_URL}/referrals/conjunto/${conjuntoId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Error al obtener referidos");
  }

  return res.json();
}

export async function getMe() {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  const res = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Error al obtener usuario");
  }

  return res.json();
}
