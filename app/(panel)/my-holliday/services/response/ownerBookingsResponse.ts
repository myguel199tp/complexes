import { GuestReputation } from "./pendingGuestReviewResponse";
import { DamageClaimView } from "@/app/components/booking-damage-claim";

/** En qué punto está la reserva, visto por el anfitrión. */
export type OwnerBookingStage =
  | "pendiente"
  | "proxima"
  | "en_curso"
  | "terminada"
  | "no_se_presento"
  | "cancelada";

/**
 * A dónde va el dinero de la reserva. `estado` es el giro de la estadía:
 * `pending`: la plataforma lo tiene; `ready`: ya se le debe al anfitrión;
 * `paid`: ya se le giró; `void`: reembolso total, no hay nada que girar. Los
 * daños aprobados son un giro aparte (`pagoDanos`).
 */
export type BookingSettlementView = {
  estado: "pending" | "ready" | "paid" | "void";
  moneda: string;
  pagoHuesped: number;
  alojamiento: number;
  iva: number;
  aseo: number;
  /** Lo que dejó el huésped de depósito; 0 si tomó la protección. */
  deposito: number;
  /** `protection`: el huésped pagó la protección de daños en vez del depósito. */
  modoDeposito?: "deposit" | "protection";
  tarifaProteccion?: number;
  comisionPorcentaje: number;
  comision: number;
  reembolsoHuesped: number;
  devolucionDeposito: number;
  paraAnfitrion: number;
  listaDesde: string | null;
  pagadaEl: string | null;
  /**
   * La entrega del inmueble. `review`: puedes recibirlo o reportar daños
   * hasta `revisionHasta`; `claimed`: reportaste daños y la plataforma
   * decide; `resolved`: cerrada.
   */
  depositoEstado?: "none" | "review" | "claimed" | "resolved";
  revisionHasta?: string | null;
  /** Daños que te aprobaron: se te giran aparte de la estadía. */
  pagoDanos?: number;
  danosGiradosEl?: string | null;
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
  /** Terminó con depósito y sigue en plazo: recibir el inmueble o reportar daños. */
  puedeRecibir?: boolean;
  /** Hasta cuánto puedes reportar: el depósito o la cobertura de la protección. */
  topeDanos?: number;
  /** Daños que reportaste al recibir el inmueble. */
  reclamo?: DamageClaimView | null;
  creadoEn: string;
  canceladoEn: string | null;
};
