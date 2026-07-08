// service/getBookingsService.ts

import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { MyBookingResponse } from "./response/BookingResponse";

// Huésped: todas las reservas que ha realizado (GET /api/booking/my-bookings)
export async function getMyBookingsService(): Promise<MyBookingResponse[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/booking/my-bookings`;

  const response = await fetchWithAuth(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return response.json();
}
