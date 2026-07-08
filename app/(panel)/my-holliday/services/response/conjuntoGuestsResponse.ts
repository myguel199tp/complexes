// Shape devuelto por GET /api/booking/conjunto/guests
export type ConjuntoGuestResponse = {
  bookingId: string;
  inmueble: {
    id: string;
    nombre: string;
    unidad: string;
    apartamento: string;
    torre: string;
  };
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
  pasajeros: number;
};
