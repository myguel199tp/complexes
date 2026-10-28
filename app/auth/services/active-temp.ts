import { backendMessage } from "@/app/helpers/backendError";

export interface ActivateAccountResponse {
  success: boolean;
  message: string;
  /** La sesión queda en cookies httpOnly; los tokens ya no llegan al cliente. */
  authenticated?: boolean;
  roles?: string[];
}

/** Códigos que manda el backend para que la pantalla sepa qué ofrecer. */
export type ActivationErrorCode =
  | "ACTIVATION_TOKEN_EXPIRED"
  | "ACTIVATION_TOKEN_INVALID"
  | "ACCOUNT_ALREADY_ACTIVE";

export class ActivationError extends Error {
  constructor(
    message: string,
    public code?: ActivationErrorCode,
  ) {
    super(message);
  }
}

async function activationError(response: Response, fallback: string) {
  // El límite por minuto lo responde el throttler de Nest, en inglés.
  if (response.status === 429) {
    return new ActivationError(
      "Hiciste varios intentos seguidos. Espera un minuto y vuelve a intentarlo.",
    );
  }

  const body = await response.json().catch(() => null);
  return new ActivationError(backendMessage(body, fallback), body?.code);
}

export async function activateTempPassword(
  token: string,
  password: string,
): Promise<ActivateAccountResponse> {
  const response = await fetch(
    `/api/auth/activate-account/${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        password,
      }),
    },
  );

  if (!response.ok) {
    throw await activationError(
      response,
      "No pudimos activar tu cuenta. Intenta de nuevo en unos minutos.",
    );
  }

  return response.json();
}

export interface ResendActivationResponse {
  success: boolean;
  message: string;
  /** Correo enmascarado al que salió el enlace nuevo (p.ej. "mi*****@gmail.com"). */
  email?: string;
}

/**
 * Pide un enlace nuevo con el token vencido: el backend lo acepta aunque haya
 * expirado y manda el correo a la dirección registrada, no a una que se escriba.
 */
export async function resendActivationLink(
  token: string,
): Promise<ResendActivationResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-activation/${encodeURIComponent(token)}`,
    { method: "POST" },
  );

  if (!response.ok) {
    throw await activationError(
      response,
      "No pudimos enviar el enlace. Intenta de nuevo en un minuto.",
    );
  }

  return response.json();
}
