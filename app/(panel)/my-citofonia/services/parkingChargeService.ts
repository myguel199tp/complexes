import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface ParkingCheckout {
  /** Lo que hay que cobrarle al visitante, ya congelado. */
  amount: number;
  durationMinutes: number;
  /** Nulo cuando no hay nada que cobrar. */
  token: string | null;
  /** Lo que codifica el QR: la página que abre el celular del visitante. */
  checkoutUrl: string | null;
  expiresAt: string | null;
  paymentStatus: string;
  plaque?: string | null;
  message?: string;
}

/**
 * Cobro del parqueadero al visitante.
 *
 * Antes el celador solo tenía "marcar pagado", que no movía plata: el cobro le
 * quedaba colgado al residente. Ahora paga quien se lleva el carro, y son dos
 * caminos —QR o efectivo con soporte— porque no todo el mundo llega con el
 * celular listo para pagar.
 */
export class ParkingChargeService {
  private readonly baseUrl = process.env.NEXT_PUBLIC_API_URL;

  /** Liquida la cuenta y abre el cobro. Repetirlo no mueve el monto. */
  async startCheckout(
    conjuntoId: string,
    visitId: string,
  ): Promise<ParkingCheckout> {
    const response = await fetchWithAuth(
      `${this.baseUrl}/api/visit/${visitId}/parking/checkout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error generando el cobro");
    }

    return response.json();
  }

  /**
   * PNG del QR. Va por el mismo camino autenticado que las fotos de portería:
   * un `<img src>` no puede mandar cabeceras, así que se baja el binario y se
   * expone como object URL.
   */
  async getQrBlob(conjuntoId: string, visitId: string): Promise<Blob> {
    const response = await fetchWithAuth(
      `${this.baseUrl}/api/visit/${visitId}/parking/qr`,
      { headers: { "x-conjunto-id": conjuntoId } },
    );

    if (!response.ok) {
      throw new Error("No se pudo generar el QR de pago");
    }

    return response.blob();
  }

  /**
   * Efectivo recibido en la reja. El soporte es obligatorio: es la única
   * prueba de que esa plata existe y de quién la tiene mientras administración
   * cuadra caja.
   */
  async payCash(conjuntoId: string, visitId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetchWithAuth(
      `${this.baseUrl}/api/visit/${visitId}/parking/cash`,
      {
        method: "POST",
        body: formData,
        headers: { "x-conjunto-id": conjuntoId },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error registrando el efectivo");
    }

    return response.json();
  }
}
