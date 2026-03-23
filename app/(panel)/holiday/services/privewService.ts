import { privewRequest } from "./request/privewRequest";
import { BookingPreviewResponse } from "./response/privewResponse";

export async function createPrivewtService(
  data: privewRequest
): Promise<BookingPreviewResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/booking/preview`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error creando el pago: ${errorText}`);
  }

  return response.json();
}
