import { CreateAssemblyRequest } from "./request/assemblyRequest";

export class DataAsemblyServices {
  async addAssembly(
    conjuntoId: string,
    data: CreateAssemblyRequest,
  ): Promise<Response> {
    const response = await fetch("/api/assembly/create", {
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
