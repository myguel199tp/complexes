// // import { CityResposne } from "./response/cityResponse";
import { RegisterConjuntoResponse } from "./response/conjuntoResponse";
import {
  CreateConjuntoRelation,
  CreateUserConjuntoRelation,
} from "./response/registerRelationResponse";
import { RegisterResponse } from "./response/registerResponse";
import { SearchConjuntoResponse } from "./response/searchConjntoResponse";

export class DataRegister {
  private async parseJsonSafe(response: Response) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  // 🧩 Registrar usuario
  async registerUser(formData: FormData): Promise<RegisterResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await this.parseJsonSafe(response);

    if (!response.ok) {
      throw new Error(data?.error || "Error al registrar usuario");
    }

    return data;
  }

  // 🏢 Registrar conjunto
  async registerConjunto(
    formData: FormData,
  ): Promise<RegisterConjuntoResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/register-conjunto`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await this.parseJsonSafe(response);

    if (!response.ok) {
      throw new Error(data?.error || "Error al registrar conjunto");
    }

    return { status: response.status, data };
  }

  // 🔍 Buscar conjunto por NIT
  async searchByNit(nit: string): Promise<SearchConjuntoResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/conjunto-by-nit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nit }),
      },
    );

    const data = await this.parseJsonSafe(response);

    if (!response.ok) {
      throw new Error(data?.error || "Error al buscar conjunto por NIT");
    }

    return data;
  }

  // 👥 Registrar relación user-conjunto por archivo FormData
  async registerConjuntoUser(formData: FormData): Promise<Response> {
    return fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation`,
      {
        method: "POST",
        body: formData,
      },
    );
  }

  // 🔗 Registrar relación user-conjunto JSON
  async registerRelationConjunto(
    payload: CreateUserConjuntoRelation,
  ): Promise<CreateConjuntoRelation> {
    if (!payload.userId || !payload.conjuntoId) {
      throw new Error(
        "❌ Falta userId o conjuntoId antes de llamar al backend",
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/relation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = await this.parseJsonSafe(response);

    if (!response.ok) {
      console.error("❌ Error desde backend:", data);
      throw new Error(data?.error || "Error al registrar relación");
    }

    return { status: response.status, data };
  }

  // 🏘️ Obtener conjunto por ID
  async getConjuntoById(id: string): Promise<RegisterConjuntoResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/${id}`,
      {
        method: "GET",
      },
    );

    const data = await this.parseJsonSafe(response);

    if (!response.ok) {
      throw new Error(data?.error || "Error al obtener conjunto");
    }

    return data;
  }

  // 🔐 Obtener conjunto del usuario autenticado (opcional)
  async getMyConjunto(token: string): Promise<RegisterConjuntoResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/my-conjunto`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      },
    );

    const data = await this.parseJsonSafe(response);

    if (!response.ok) {
      throw new Error(data?.error || "Error al obtener conjunto del usuario");
    }

    return data;
  }

  async registerUserBasic(formData: FormData): Promise<Response> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register-basic`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await this.parseJsonSafe(response);

    if (!response.ok) {
      throw new Error(data?.error || "Error al registrar usuario");
    }

    return data;
  }
}
