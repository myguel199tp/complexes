import { ForumPayload } from "../_components/cosntants";

export class DataForoServices {
  async addForo(conjuntoId: string, data: ForumPayload): Promise<Response> {
    const response = await fetch(`/api/cuestion/creates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al agregar el foro: ${errorText}`);
    }

    return response;
  }
}
