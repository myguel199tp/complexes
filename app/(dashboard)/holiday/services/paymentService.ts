export interface CreatePaymentDto {
  amount: number;
  currency: string;
  plan: "BASICO" | "ORO" | "PLATINO";
  propertyType: "INTERNO" | "EXTERNO";
  hostAccountId: string;
  conjuntoAccountId: string;
  description?: string;
}

export interface CreatePaymentResponse {
  clientSecret: string;
  paymentIntentId: string;
  distribution: {
    hostAmount: number;
    conjuntoAmount: number;
    platformAmount: number;
  };
}

/**
 * 🔹 Servicio que se comunica con el backend NestJS para crear un PaymentIntent
 */
export async function createPaymentService(
  data: CreatePaymentDto
): Promise<CreatePaymentResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create-payment`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error creando el pago: ${errorText}`);
  }

  return response.json();
}
