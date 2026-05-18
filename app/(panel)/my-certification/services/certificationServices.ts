import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class DataCertificationServices {
  async addCertification(conjuntoId: string, data: FormData) {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/record/register-record`,
      {
        method: "POST",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );

    const result = await response;

    if (!response.ok) {
      throw result;
    }

    return result;
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
