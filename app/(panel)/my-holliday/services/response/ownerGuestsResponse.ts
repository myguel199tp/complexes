import { GuestReputation } from "./pendingGuestReviewResponse";

// Shape devuelto por GET /api/booking/owner/:hollidayId/guests
export type GuestResponse = {
  bookingId: string;
  huesped: {
    nombre: string;
    /** Lo que otros anfitriones publicaron de este huésped; null si nadie. */
    calificacion: GuestReputation | null;
    email: string;
    telefono: string;
    documento: string;
    contactoEmergencia: {
      nombre?: string;
      telefono?: string;
    };
  };
  fechas: {
    entrada: string;
    salida: string;
  };
  noches: number;
  totalPagado: number;
  pasajeros: number;
};
