import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { CreateBookingRequest } from "./request/bookingRequest";
import { CreateBookingResponse } from "./response/bookingResponse";

export async function createBookingService(
  data: CreateBookingRequest,
  conjuntoId: string,
): Promise<CreateBookingResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/booking`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(data),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message);
  }

  return result;
}
