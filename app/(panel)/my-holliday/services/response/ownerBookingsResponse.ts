import { GuestReputation } from "./pendingGuestReviewResponse";

/** En qué punto está la reserva, visto por el anfitrión. */
export type OwnerBookingStage =
  | "pendiente"
  | "proxima"
  | "en_curso"
  | "terminada"
  | "no_se_presento"
  | "cancelada";

/**
 * A dónde va el dinero de la reserva. `pending`: la plataforma lo tiene;
 * `ready`: ya se le debe al anfitrión; `paid`: ya se le giró; `void`:
 * reembolso total, no hay nada que girar.
 */
export type BookingSettlementView = {
  estado: "pending" | "ready" | "paid" | "void";
  moneda: string;
  pagoHuesped: number;
  alojamiento: number;
  iva: number;
  aseo: number;
  deposito: number;
  comisionPorcentaje: number;
  comision: number;
  reembolsoHuesped: number;
  devolucionDeposito: number;
  paraAnfitrion: number;
  listaDesde: string | null;
  pagadaEl: string | null;
};

// Shape devuelto por GET /api/booking/owner/bookings
export type OwnerBooking = {
  bookingId: string;
  estado: "pending" | "confirmed" | "completed" | "no_show" | "cancelled";
  etapa: OwnerBookingStage;
  inmueble: { id: string; nombre: string };
  huesped: {
    nombre: string;
    calificacion: GuestReputation | null;
    /** Solo mientras la reserva está viva. */
    email: string | null;
    telefono: string | null;
  };
  fechas: { entrada: string; salida: string };
  noches: number;
  pasajeros: number;
  totalPagado: number;
  /** Antes de la llegada; con el huésped adentro no se cancela desde aquí. */
  puedeCancelar: boolean;
  llegada: string | null;
  /** El día de llegada o durante la estadía, si nadie la marcó todavía. */
  puedeMarcarLlegada: boolean;
  /** Desde el día siguiente a la llegada, si no hay constancia de que entró. */
  puedeMarcarNoShow: boolean;
  liquidacion: BookingSettlementView | null;
  creadoEn: string;
  canceladoEn: string | null;
};
