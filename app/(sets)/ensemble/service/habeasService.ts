import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { HabeaResposne } from "./response/habeasResponse";
import { backendMessage } from "@/app/helpers/backendError";

export async function allHabeasService(
  documentId: string,
): Promise<HabeaResposne[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/habeas/user/${documentId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(backendMessage(errorText));
  }

  return await response.json();
}
