// Shape devuelto por GET /api/booking/owner/:hollidayId/guests
export type GuestResponse = {
  bookingId: string;
  huesped: {
    nombre: string;
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
