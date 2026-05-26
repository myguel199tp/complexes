import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { Sidebarresponse } from "./sidebarResponse";

export async function allSidebarService(
  conjuntoId: string,
): Promise<Sidebarresponse[]> {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sidebar/all-modules`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
        credentials: "include",
      },
    );

    const text = await response.text();

    return JSON.parse(text);
  } catch (error) {
    console.error("ERROR REAL", error);

    throw error;
  }
}
