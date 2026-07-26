import {
  ICreateBookingRequest,
  IRateSellerRequest,
} from "./request/orderRequest";
import {
  AvailabilityResponse,
  BookingResponse,
  BookingStatus,
} from "./response/marketplaceResponse";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/service-booking`;

async function unwrap<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => null);

    const message = Array.isArray(error?.message)
      ? error.message.join(", ")
      : error?.message;

    throw new Error(message || fallback);
  }

  return response.json();
}

export class DataBookingServices {
  /**
   * Franjas libres de un servicio en una fecha.
   * `date` va como "YYYY-MM-DD"; el backend resuelve el horario del negocio,
   * la duración del servicio y las citas ya tomadas.
   */
  async availability(
    conjuntoId: string,
    serviceId: string,
    date: string,
  ): Promise<AvailabilityResponse> {
    const params = new URLSearchParams({ serviceId, date });

    const response = await fetchWithAuth(`${BASE}/availability?${params}`, {
      headers: { "x-conjunto-id": conjuntoId },
    });

    return unwrap<AvailabilityResponse>(
      response,
      "No se pudo consultar la disponibilidad",
    );
  }

  async create(
    conjuntoId: string,
    data: ICreateBookingRequest,
  ): Promise<BookingResponse> {
    const response = await fetchWithAuth(BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(data),
    });

    return unwrap<BookingResponse>(response, "No se pudo agendar la cita");
  }

  /** Citas que pedí como cliente. */
  async myBookings(conjuntoId: string): Promise<BookingResponse[]> {
    const response = await fetchWithAuth(`${BASE}/my-bookings`, {
      headers: { "x-conjunto-id": conjuntoId },
    });

    return unwrap<BookingResponse[]>(
      response,
      "No se pudieron cargar tus citas",
    );
  }

  /** Citas que me pidieron como prestador del servicio. */
  async myAgenda(conjuntoId: string): Promise<BookingResponse[]> {
    const response = await fetchWithAuth(`${BASE}/my-agenda`, {
      headers: { "x-conjunto-id": conjuntoId },
    });

    return unwrap<BookingResponse[]>(
      response,
      "No se pudo cargar tu agenda",
    );
  }

  async updateStatus(
    conjuntoId: string,
    id: string,
    body: {
      status: BookingStatus;
      sellerMessage?: string;
      cancellationReason?: string;
    },
  ): Promise<BookingResponse> {
    const response = await fetchWithAuth(`${BASE}/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(body),
    });

    return unwrap<BookingResponse>(response, "No se pudo actualizar la cita");
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
