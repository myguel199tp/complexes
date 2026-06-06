import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { CreateAssemblyRequest } from "./request/assemblyRequest";

export class DataAsemblyServices {
  async addAssembly(
    conjuntoId: string,
    data: CreateAssemblyRequest,
  ): Promise<Response> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/assemblies/creation`;

    const response = await fetchWithAuth(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al agregar el foro: ${errorText}`);
    }

    return response;
  }
}
