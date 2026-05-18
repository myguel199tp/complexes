import { ICreateOrderRequest } from "./request/orderRequest";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class DataOrderServices {
  async addOrders(data: ICreateOrderRequest) {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      console.error("Error al crear la orden:", error);
      throw new Error(error?.message || "Error al agregar la orden");
    }

    return response.json();
  }
}
