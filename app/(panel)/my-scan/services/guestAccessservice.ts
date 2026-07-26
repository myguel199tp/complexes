
export class GuestAccessError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface ValidateGuestAccessResponse {
  allowed: boolean;
  guestName: string;
  holliday: string;
  validTo: string;
}

export async function validateGuestAccess(
  accessCode: string,
): Promise<ValidateGuestAccessResponse> {
  // El Bearer lo añade /api/proxy desde la cookie httpOnly.
  const res = await fetch("/api/proxy/api/guest-access/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({ accessCode }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new GuestAccessError(body.message || "Acceso denegado", res.status);
  }

  return body;
}
