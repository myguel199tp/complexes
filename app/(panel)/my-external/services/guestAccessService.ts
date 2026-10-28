import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

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
      throw await backendError(response, "Error revocando el acceso");
    }

    return response.json();
  }
}
