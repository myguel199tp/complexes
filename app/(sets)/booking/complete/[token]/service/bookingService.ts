import { ConfirmBookingPayload } from "./request/bokkingRequest";

export async function confirmBooking(payload: ConfirmBookingPayload) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/booking/confirm`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Error confirmando la reserva");
  }

  return result;
}
