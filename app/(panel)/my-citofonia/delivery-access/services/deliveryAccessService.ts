
export class DeliveryAccessError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface DeliveryAccessStop {
  orderId: string;
  deliveryAddress?: string;
}

export interface ValidateDeliveryAccessResponse {
  allowed: boolean;
  deliveryName?: string;
  licensePlate?: string;
  validTo: string;
  stops: DeliveryAccessStop[];
}

export async function validateDeliveryAccess(
  code: string,
  conjuntoId: string,
): Promise<ValidateDeliveryAccessResponse> {
  // El Bearer lo añade /api/proxy desde la cookie httpOnly.
  const res = await fetch("/api/proxy/api/delivery-access/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    credentials: "same-origin",
    body: JSON.stringify({ code }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new DeliveryAccessError(
      body.message || "Acceso denegado",
      res.status,
    );
  }

  return body;
}
