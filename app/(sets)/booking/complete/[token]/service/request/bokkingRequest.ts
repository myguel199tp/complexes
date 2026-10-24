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
}

export interface ConfirmBookingPayload {
  token: string;
  documentType: "CC" | "PASSPORT";
  documentNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  acceptTerms: boolean;
}
