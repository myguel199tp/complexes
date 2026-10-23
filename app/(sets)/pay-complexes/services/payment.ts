import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export async function createPayment(payload: {
  user_id: string;
  conjuntoId: string;
  country: string;
  amount: number;
  currency: string;
  reference: string;
  /** "add" suma la licencia del básico al plan; "only" paga sólo ella. */
  basicLicense?: "add" | "only";
  /** Pagar un año de historial completo del básico de por vida. */
  basicHistory?: boolean;
}) {
  // El controller exige JwtAuthGuard: la petición debe pasar por /api/proxy
  // para que el Bearer se adjunte desde la cookie httpOnly.
  const res = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/payment-method`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error("Error creando el pago");
  }

  return res.json();
}
