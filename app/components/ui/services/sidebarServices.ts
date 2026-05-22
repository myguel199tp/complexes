import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { Sidebarresponse } from "./sidebarResponse";

export async function allSidebarService(
  conjuntoId: string,
): Promise<Sidebarresponse[]> {
  try {
    console.log("SERVICE conjuntoId", conjuntoId);

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

    console.log("RESPONSE COMPLETA", response);

    console.log("STATUS", response?.status);

    const text = await response.text();

    console.log("TEXT RESPONSE", text);

    return JSON.parse(text);
  } catch (error) {
    console.log("ERROR REAL", error);

    throw error;
  }
}
