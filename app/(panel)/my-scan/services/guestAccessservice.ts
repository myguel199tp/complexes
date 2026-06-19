import nookies from "nookies";

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
  const { accessToken } = nookies.get(null);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/guest-access/validate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ accessCode }),
    },
  );

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new GuestAccessError(body.message || "Acceso denegado", res.status);
  }

  return body;
}
