import { CityResposne } from "./response/cityResponse";
import { RegisterConjuntoResponse } from "./response/conjuntoResponse";
import {
  CreateConjuntoRelation,
  CreateUserConjuntoRelation,
} from "./response/registerRelationResponse";
import { RegisterResponse } from "./response/registerResponse";
import { SearchConjuntoResponse } from "./response/searchConjntoResponse";

export class DataRegister {
  async registerUser(formData: FormData): Promise<RegisterResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error || "Error al registrar conjunto");
    }

    return response.json(); // Aquí retornas el cuerpo ya procesado
  }

  async registerConjunto(
    formData: FormData
  ): Promise<RegisterConjuntoResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/register-conjunto`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Error al registrar conjunto");
    }

    return {
      status: response.status,
      data,
    };
  }

  async searchByNit(nit: string): Promise<SearchConjuntoResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/conjunto-by-nit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nit }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Error al buscar conjunto por NIT");
    }

    return data;
  }

  async registerConjuntoUser(formData: FormData): Promise<Response> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation`,
      {
        method: "POST",
        body: formData,
      }
    );

    return response;
  }

  async registerRelationConjunto(
    payload: CreateUserConjuntoRelation
  ): Promise<CreateConjuntoRelation> {
    // 🔍 Log de depuración antes de enviar
    console.log("📦 Payload enviado al backend:", payload);

    // Validar antes de enviar
    if (!payload.user.id || !payload.conjunto.id) {
      throw new Error(
        "❌ Falta userId o conjuntoId antes de llamar al backend"
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/relation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error desde backend:", data);
      throw new Error(data?.error || "Error al registrar conjunto");
    }

    return {
      status: response.status,
      data,
    };
  }

  async cityService(): Promise<CityResposne[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/city`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.statusText}`);
    }

    const data: CityResposne[] = await response.json();
    return data;
  }
}
