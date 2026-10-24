/**
 * `completed`: la estadía ya terminó; desde ahí se puede calificar.
 * `no_show`: el anfitrión marcó que el huésped nunca llegó.
 */
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "no_show"
  | "cancelled";

/** Política de cancelación de la reserva, congelada al reservar. */
export type CancellationPolicyView = {
  codigo: "flexible" | "moderate" | "strict";
  nombre: string;
  descripcion: string;
};

/**
 * Cómo va la calificación de la estadía. Ninguna de las dos reseñas es pública
 * hasta que ambos califican o vence el plazo.
 */
export type BookingReviewState = {
  puedeCalificar: boolean;
  /** Último día para calificar (YYYY-MM-DD); null si no ha terminado. */
  venceEl: string | null;
  mia: { rating: number; comment: string | null; publicada: boolean } | null;
  /** Lo que escribió el anfitrión, solo cuando ya es público. */
  delAnfitrion: { rating: number; comment: string | null } | null;
};

// Shape devuelto por GET /api/booking/my-bookings
export type MyBookingResponse = {
  bookingId: string;
  estado: BookingStatus;
  inmueble: {
    id: string;
    nombre: string;
    unidad: string;
    apartamento: string;
    torre: string;
    ciudad: string;
    pais: string;
    imagen?: string;
  };
  fechas: {
    entrada: string;
    salida: string;
  };
  noches: number;
  totalPagado: number;
  pasajeros: number;
  codigoAcceso?: string | null;
  /**
   * Rol temporal del huésped dentro del conjunto durante su estancia.
   * null cuando el inmueble es externo (finca, casa independiente): ahí no hay
   * comunidad en la que registrarse.
   */
  accesoConjunto?: {
    rol: string;
    vigente: boolean;
    desde: string | null;
    hasta: string | null;
    torre: string | null;
    apartamento: string | null;
  } | null;
  resena: BookingReviewState | null;
  /** Solo en pendientes: hasta cuándo se puede retomar antes de que se suelten las noches. */
  completarAntesDe: string | null;
  politicaCancelacion: CancellationPolicyView;
  /** Hasta el día de llegada; el monto exacto lo da el cancel-preview. */
  puedeCancelar: boolean;
  /** Lo que vuelve: reembolso si canceló o no llegó, depósito si terminó bien. */
  devolucion: {
    monto: number;
    moneda: string;
    concepto: "reembolso" | "deposito";
  } | null;
  creadoEn: string;
};
