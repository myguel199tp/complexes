import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { HabeaResposne } from "./response/habeasResponse";

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
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return await response.json();
}
