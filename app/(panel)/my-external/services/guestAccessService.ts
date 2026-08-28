import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class DataGuestAccessService {
  async revoke(id: string, conjuntoId: string) {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/guest-access/${id}/revoke`,
      {
        method: "PATCH",
        headers: { "x-conjunto-id": conjuntoId },
      },
    );

    if (!response.ok) {
      throw new Error("Error revocando el acceso");
    }

    return response.json();
  }
}
