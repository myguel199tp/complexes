import { InmovableinfoResponses } from "./response/inmovableInfoResponse";
import { backendError } from "@/app/helpers/backendError";

export async function inmovableInfoService(
  iduser: string,
): Promise<InmovableinfoResponses[]> {
  const queryParams = new URLSearchParams({ iduser });

  const url = `${
    process.env.NEXT_PUBLIC_API_URL
  }/api/sales/byuser?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: InmovableinfoResponses[] = await response.json();
  return data;
}
