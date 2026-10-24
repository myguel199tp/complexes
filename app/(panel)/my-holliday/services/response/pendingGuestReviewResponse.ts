// Promedio de lo que otros anfitriones publicaron del huésped
export type GuestReputation = {
  promedio: number;
  total: number;
};

// Shape devuelto por GET /api/holliday-review/guest/pending
export type PendingGuestReview = {
  bookingId: string;
  huesped: {
    nombre: string;
    calificacion: GuestReputation | null;
  };
  inmueble: { id: string; nombre: string };
  fechas: { entrada: string; salida: string };
  /** Último día para calificar (YYYY-MM-DD). */
  venceEl: string;
  /** El huésped ya calificó el lugar: su reseña sale cuando el anfitrión escriba la suya. */
  huespedYaCalifico: boolean;
};
