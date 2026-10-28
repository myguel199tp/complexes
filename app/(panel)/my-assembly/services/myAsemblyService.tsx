import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { CreateAssemblyRequest } from "./request/assemblyRequest";
import { backendMessage } from "@/app/helpers/backendError";

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
      throw new Error(
        backendMessage(errorText, "Error al agregar la asamblea"),
      );
    }

    return response;
  }
}
