import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { RegisterFamilyRequest } from "./request/registerFamilyRequest";
import {
  FamilyQuotaResponse,
  RegisterFamilyResponse,
} from "./response/familyResponse";

const EMPTY_QUOTA: FamilyQuotaResponse = {
  plan: "basic",
  maxAllowed: 1,
  used: 0,
  available: 1,
  members: [],
};

export async function familyMembersService(
  conjuntoId: string,
): Promise<FamilyQuotaResponse> {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/family`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    if (!response.ok) {
      // 403 es el caso normal de quien no es propietario en este conjunto: no
      // hay familiares que mostrar y no es un error que valga una alerta.
      if (response.status === 403) return EMPTY_QUOTA;

      const error = await response.json().catch(() => ({}));
      throw new Error(error?.message ?? "Error al consultar los familiares");
    }

    return await response.json();
  } catch (error) {
    if ((error as Error).message === "PLAN_EXPIRED") {
      return EMPTY_QUOTA;
    }

    throw error;
  }
}

export async function registerFamilyService(
  conjuntoId: string,
  data: RegisterFamilyRequest,
): Promise<RegisterFamilyResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register-family`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(data),
      credentials: "include",
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    // El backend manda el mensaje de cupo agotado aquí; mostrarlo tal cual es
    // más útil que un texto genérico porque nombra el plan y cuántos quedan.
    const message = Array.isArray(error?.message)
      ? error.message.join(", ")
      : error?.message;

    throw new Error(message ?? "Error al registrar el familiar");
  }

  return await response.json();
}
