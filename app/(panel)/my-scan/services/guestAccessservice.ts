const API = process.env.NEXT_PUBLIC_API_URL;

export async function validateGuestAccess(accessCode: string) {
  const res = await fetch(`${API}/guest-access/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessCode }),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Acceso denegado");
  }

  return res.json();
}
