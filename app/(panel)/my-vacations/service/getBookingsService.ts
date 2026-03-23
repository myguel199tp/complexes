// service/getBookingByIdService.ts

import { BookingResponse } from "./response/BookingResponse";

export async function getBookingByIdService(
  id: string,
): Promise<BookingResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/booking/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return response.json();
}
