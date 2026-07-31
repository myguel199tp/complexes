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
  /**
   * Rol temporal del huésped dentro del conjunto durante su estancia.
   * null cuando el inmueble es externo (finca, casa independiente): ahí no hay
   * comunidad en la que registrarse.
   */
  accesoConjunto?: {
    rol: string;
    vigente: boolean;
    desde: string | null;
    hasta: string | null;
    torre: string | null;
    apartamento: string | null;
  } | null;
  creadoEn: string;
};
