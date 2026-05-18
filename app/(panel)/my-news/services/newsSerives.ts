import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class DataNewsServices {
  async addNews(conjuntoId: string, data: FormData) {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/new-admin/register-admin`,
      {
        method: "POST",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw result;
    }

    return result;
  }

  async updateNews(conjuntoId: string, id: string, data: FormData) {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/new-admin/${id}`,
      {
        method: "PATCH",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw result;
    }

    return result;
  }
}
