import {
  ICreateOrderRequest,
  IRateSellerRequest,
} from "./request/orderRequest";
import { OrderResponse, OrderStatus } from "./response/marketplaceResponse";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/order`;

/**
 * Devuelve el mensaje real del backend en vez de un texto genérico.
 * Importa aquí: los errores útiles son "solo quedan 3 unidades" o "ese negocio
 * no atiende ese día", y antes se perdían.
 */
async function unwrap<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => null);

    // Nest devuelve `message` como string o como array de errores de validación.
    const message = Array.isArray(error?.message)
      ? error.message.join(", ")
      : error?.message;

    throw new Error(message || fallback);
  }

  return response.json();
}

export class DataOrderServices {
  async addOrders(
    conjuntoId: string,
    data: ICreateOrderRequest,
  ): Promise<OrderResponse> {
    const response = await fetchWithAuth(BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(data),
    });

    return unwrap<OrderResponse>(response, "No se pudo crear el pedido");
  }

  /** Pedidos que hice como comprador. */
  async myPurchases(conjuntoId: string): Promise<OrderResponse[]> {
    const response = await fetchWithAuth(`${BASE}/my-purchases`, {
      headers: { "x-conjunto-id": conjuntoId },
    });

    return unwrap<OrderResponse[]>(
      response,
      "No se pudieron cargar tus pedidos",
    );
  }

  /** Pedidos que recibieron mis negocios. */
  async mySales(conjuntoId: string): Promise<OrderResponse[]> {
    const response = await fetchWithAuth(`${BASE}/my-sales`, {
      headers: { "x-conjunto-id": conjuntoId },
    });

    return unwrap<OrderResponse[]>(
      response,
      "No se pudieron cargar tus ventas",
    );
  }

  async updateStatus(
    conjuntoId: string,
    id: string,
    body: {
      status: OrderStatus;
      sellerMessage?: string;
      cancellationReason?: string;
    },
  ): Promise<OrderResponse> {
    const response = await fetchWithAuth(`${BASE}/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(body),
    });

    return unwrap<OrderResponse>(response, "No se pudo actualizar el pedido");
  }

  async rate(conjuntoId: string, id: string, body: IRateSellerRequest) {
    const response = await fetchWithAuth(`${BASE}/${id}/rating`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(body),
    });

    return unwrap(response, "No se pudo enviar la calificación");
  }
}
