import { parseCookies } from "nookies";

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

  async uploadPayment(conjuntoId: string, visitId: string, file: File) {
    const formData = new FormData();
    const cookies = parseCookies();
    const token = cookies.accessToken;
    formData.append("file", file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/visit/upload-payment/${visitId}`,
      {
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
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
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/visit/approve-payment/${visitId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
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
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/visit/reject-payment/${visitId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
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
