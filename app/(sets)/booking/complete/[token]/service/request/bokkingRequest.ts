/** Resumen de GET /api/booking/complete/:token. Sin contacto ni documento. */
export interface BookingCompletionSummary {
  bookingId: string;
  estado: "pending" | "confirmed" | "completed" | "no_show" | "cancelled";
  /** Solo el nombre de pila. */
  nombre: string;
  inmueble: string | null;
  entrada: string;
  salida: string;
  noches: number;
  pasajeros: number;
  total: number;
  moneda: string;
  politicaCancelacion: { codigo: string; nombre: string; descripcion: string };
  completarAntesDe: string | null;
  /** `mercadopago`: confirmar manda a pagar. `estado` es el del pago en Mercado Pago. */
  pago?: { cobro: "simulated" | "mercadopago"; estado: string | null };
}

/** Respuesta de POST /api/booking/payment-sync al volver de Mercado Pago. */
export interface BookingPaymentSync {
  bookingId: string;
  estado: BookingCompletionSummary["estado"] | null;
  /** approved, rejected, pending, in_process, refunded… o null si no hay pago. */
  pago: string | null;
}

export interface ConfirmBookingPayload {
  token: string;
  documentType: "CC" | "PASSPORT";
  documentNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  acceptTerms: boolean;
}
