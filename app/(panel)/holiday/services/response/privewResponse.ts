export interface BookingPreviewResponse {
  subtotal: number;
  discount: number;
  taxes: number;
  /** IVA del país del inmueble en Tarifas (19 = 19 %). */
  taxPercent?: number;
  cleaningFee: number;
  /** Se devuelve al terminar la estadía si el anfitrión no reporta daños. */
  deposit: number;
  /** El que quedó aplicado: si el país no ofrece la protección, `deposit`. */
  depositMode?: "deposit" | "protection";
  /** Lo que cuesta la protección en esta reserva; 0 con depósito. */
  protectionFee?: number;
  /** La opción de protección, para ofrecerla antes de reservar. */
  proteccion?: {
    disponible: boolean;
    tarifa: number;
    porcentaje: number;
    /** Hasta cuánto cubre: el depósito del inmueble. */
    cobertura: number;
    /** Cobrando por Mercado Pago no hay depósito: la protección no se elige. */
    obligatoria?: boolean;
  };
  /** `false` con Mercado Pago: no se ofrece dejar depósito. */
  depositoDisponible?: boolean;
  /** `mercadopago`: al completar la reserva se paga en Mercado Pago. */
  cobro?: "simulated" | "mercadopago";
  /** Si se puede reservar; si no, `motivo` dice por qué. */
  available?: boolean;
  motivo?: string | null;
  total: number;
}
