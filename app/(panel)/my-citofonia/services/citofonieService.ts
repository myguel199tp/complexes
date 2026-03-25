export class CitofonieService {
  async registerVisit(conjuntoId: string, data: FormData) {
    const response = await fetch(`/api/cito/create`, {
      method: "POST",
      body: data,
      headers: {
        "x-conjunto-id": conjuntoId,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al registrar visita");
    }

    return response.json();
  }
}
