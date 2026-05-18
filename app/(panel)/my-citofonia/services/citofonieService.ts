import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class CitofonieService {
  async registerVisit(conjuntoId: string, data: FormData) {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/visit/register-visit`,
      {
        method: "POST",
        body: data,
        headers: {
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al registrar visita");
    }

    return response.json();
  }

  async uploadPayment(conjuntoId: string, visitId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/visit/upload-payment/${visitId}`,
      {
        method: "PATCH",
        body: formData,
        headers: {
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al subir comprobante");
    }

    return response.json();
  }
  async approvePayment(conjuntoId: string, visitId: string) {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/visit/approve-payment/${visitId}`,
      {
        method: "PATCH",
        headers: {
          "x-conjunto-id": conjuntoId,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error aprobando pago");
    }

    return response.json();
  }

  async rejectPayment(conjuntoId: string, visitId: string) {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/visit/reject-payment/${visitId}`,
      {
        method: "PATCH",
        headers: {
          "x-conjunto-id": conjuntoId,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error rechazando pago");
    }

    return response.json();
  }
}
