// Shape devuelto por GET /api/booking/my-bookings
export type MyBookingResponse = {
  bookingId: string;
  estado: string;
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
  creadoEn: string;
};
