import { CreateBookingRequest } from "./request/bookingRequest";
import { CreateBookingResponse } from "./response/bookingResponse";

export async function createBookingService(
  data: CreateBookingRequest
): Promise<CreateBookingResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/booking`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || "Error creando el pago");
  }

  return result; // 👈 JSON ya listo
}
