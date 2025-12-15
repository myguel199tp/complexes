export async function createPayment(payload: {
  user_id: string;
  conjunto_id: string;
  country: string;
  amount: number;
  currency: string;
  reference: string;
}) {
  const res = await fetch(
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
