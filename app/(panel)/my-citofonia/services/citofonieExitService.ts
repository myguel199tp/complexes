import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/**
 * El parqueadero tiene saldo y el backend no cierra la visita.
 *
 * Se distingue del error genérico porque no es una falla: es el flujo normal
 * de la reja. La pantalla lo usa para abrir el cobro en vez de mostrar una
 * alerta roja de "algo salió mal".
 */
export class ParkingDueError extends Error {
  readonly amountDue: number;
  readonly durationMinutes: number;
  readonly plaque?: string;

  constructor(payload: {
    message: string;
    amountDue: number;
    durationMinutes: number;
    plaque?: string;
  }) {
    super(payload.message);
    this.name = "ParkingDueError";
    this.amountDue = payload.amountDue;
    this.durationMinutes = payload.durationMinutes;
    this.plaque = payload.plaque;
  }
}

export class CitofonieExitService {
  /**
   * `overrideReason` deja salir el vehículo con el parqueadero sin pagar. No es
   * un parámetro más: queda grabado con el nombre de quien autorizó, así que
   * solo se manda cuando el celador escribió el motivo a propósito.
   */
  async exitVisit(conjuntoId: string, id: string, overrideReason?: string) {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetchWithAuth(`${BASE_URL}/api/visit/exit/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(overrideReason ? { overrideReason } : {}),
    });

    if (!response.ok) {
      const error = await response.json();

      // 402: el visitante todavía debe el parqueadero.
      if (response.status === 402) {
        throw new ParkingDueError({
          message: error.message || "El visitante debe pagar el parqueadero",
          amountDue: error.amountDue ?? 0,
          durationMinutes: error.durationMinutes ?? 0,
          plaque: error.plaque,
        });
      }

      throw new Error(error.message || "Error al finalizar visita");
    }

    return response.json();
  }
}
