import { InmovableResponses } from "../../immovables/services/response/inmovableResponses";

interface Filters {
  id?: string;
}

export async function immovableSummaryService(
  filters: Filters = {}
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
      response.statusText
    );
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: InmovableResponses = await response.json();

  // 🟢 Log del resultado
  console.log("✅ Respuesta recibida desde el backend:", data);

  return data;
}
