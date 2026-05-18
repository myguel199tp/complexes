import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class DataActivityServices {
  async addActivity(conjuntoId: string, data: FormData) {
    return fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/activities/register-activity`,
      {
        method: "POST",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );
  }

  async updateActivity(conjuntoId: string, id: string, data: FormData) {
    return fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/activities/update-activity/${id}`,
      {
        method: "PATCH",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );
  }

  async deleteActivity(conjuntoId: string, id: string) {
    return fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/activities/delete-activity/${id}`,
      {
        method: "DELETE",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
      },
    );
  }
}
