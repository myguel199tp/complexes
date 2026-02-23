export class HollidayServices {
  async publishHolliday(conjuntoId: string, id: string): Promise<Response> {
    if (!conjuntoId) {
      console.warn("⚠️ conjuntoId está vacío o undefined");
    }

    const response = await fetch(`/api/vacation/show/${id}/publish`, {
      method: "PATCH",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al publicar el holiday");
    }

    return response;
  }
}
