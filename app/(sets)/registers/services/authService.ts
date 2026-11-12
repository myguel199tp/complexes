import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { RegisterConjuntoResponse } from "./response/conjuntoResponse";
import {
  CreateConjuntoRelation,
  CreateUserConjuntoRelation,
} from "./response/registerRelationResponse";
import { RegisterResponse } from "./response/registerResponse";
import { SearchConjuntoResponse } from "./response/searchConjntoResponse";
import { backendMessage } from "@/app/helpers/backendError";

export class DataRegister {
  private async parseJsonSafe(response: Response) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  /**
   * `withSession`: la administración dando de alta gente desde el panel. El
   * backend ya no acepta eso sin sesión; sin ella solo deja crear al primer
   * administrador de un conjunto recién creado (el alta pública del conjunto).
   */
  async registerUser(
    formData: FormData,
    withSession = false,
  ): Promise<RegisterResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`;
    const init: RequestInit = { method: "POST", body: formData };

    const response = withSession
      ? await fetchWithAuth(url, init)
      : await fetch(url, init);

    const data = await this.parseJsonSafe(response);

    if (!response.ok) {
      throw new Error(backendMessage(data, "Error al registrar usuario"));
    }

    return data;
  }

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
      throw new Error(backendMessage(data, "Error al registrar conjunto"));
    }

    return { status: response.status, data };
  }

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
      throw new Error(backendMessage(data, "Error al buscar conjunto por NIT"));
    }

    return data;
  }

  async registerConjuntoUser(formData: FormData): Promise<Response> {
    return fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation`,
      {
        method: "POST",
        body: formData,
      },
    );
  }

  /** `withSession`: igual que en `registerUser`. */
  async registerRelationConjunto(
    payload: CreateUserConjuntoRelation,
    withSession = false,
  ): Promise<CreateConjuntoRelation> {
    if (!payload.userId || !payload.conjuntoId) {
      throw new Error(
        "❌ Falta userId o conjuntoId antes de llamar al backend",
      );
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/relation`;
    const init: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };

    const response = withSession
      ? await fetchWithAuth(url, init)
      : await fetch(url, init);

    const data = await this.parseJsonSafe(response);

    if (!response.ok) {
      console.error("❌ Error desde backend:", data);
      throw new Error(backendMessage(data, "Error al registrar relación"));
    }

    return { status: response.status, data };
  }

  async getConjuntoById(id: string): Promise<RegisterConjuntoResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/${id}`,
      {
        method: "GET",
      },
    );

    const data = await this.parseJsonSafe(response);

    if (!response.ok) {
      throw new Error(backendMessage(data, "Error al obtener conjunto"));
    }

    return data;
  }

  async getMyConjunto(token: string): Promise<RegisterConjuntoResponse> {
    const response = await fetchWithAuth(
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
      throw new Error(
        backendMessage(data, "Error al obtener conjunto del usuario"),
      );
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
      throw new Error(backendMessage(data, "Error al registrar usuario"));
    }

    return data;
  }
}
