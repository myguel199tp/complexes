import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/**
 * Alta de un servicio en el catálogo del negocio.
 *
 * El módulo `prod-serv` existía en el backend desde hace tiempo, pero ningún
 * archivo del frontend lo llamaba: por eso un vecino podía marcar su negocio
 * como de tipo SERVICE y quedarse sin nada que ofrecer.
 */
export class DataServiceCatalogService {
  async create(conjuntoId: string, data: FormData): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/prod-serv/register`,
      {
        method: "POST",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);

      const message = Array.isArray(error?.message)
        ? error.message.join(", ")
        : error?.message;

      throw new Error(message || "No se pudo registrar el servicio");
    }

    return response;
  }
}
