import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class DataCertificationServices {
  /**
   * Devuelve la respuesta tal cual, también si falla: quien llama lee el
   * mensaje del backend. Antes lanzaba el `Response` y el mensaje (por ejemplo
   * el del cupo de documentos) se perdía en un "¡Algo salió mal!".
   */
  async addCertification(conjuntoId: string, data: FormData) {
    return fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/record/register-record`,
      {
        method: "POST",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );
  }

  async updateCertification(conjuntoId: string, id: string, data: FormData) {
    return fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/record/${id}`,
      {
        method: "PATCH",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );
  }

  async deleteCertification(conjuntoId: string, id: string) {
    return fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/record/${id}`,
      {
        method: "DELETE",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
      },
    );
  }
}
