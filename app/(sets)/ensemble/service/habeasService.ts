import { HabeaResposne } from "./response/habeasResponse";

export async function allHabeasService(
  documentId: string,
): Promise<HabeaResposne[]> {
  const response = await fetch(`/api/signature/${documentId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // importante
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return await response.json();
}
