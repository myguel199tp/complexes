import { roomResponses } from "./response/roomResponse";
import { backendError } from "@/app/helpers/backendError";

export async function roomService(): Promise<roomResponses[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/room`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: roomResponses[] = await response.json();
  return data;
}
