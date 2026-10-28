import { InmovableResponses } from "../../immovables/services/response/inmovableResponses";
import { backendError } from "@/app/helpers/backendError";

interface Filters {
  id?: string;
}

export async function immovableSummaryService(
  filters: Filters = {},
): Promise<InmovableResponses> {
  const queryParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  });

  const url = `${
    process.env.NEXT_PUBLIC_API_URL
  }/api/sales/inmovable?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    console.error(
      "❌ Error en la solicitud:",
      response.status,
      response.statusText,
    );
    throw await backendError(response);
  }

  const data: InmovableResponses = await response.json();


  return data;
}
