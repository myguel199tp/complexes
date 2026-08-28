export interface ConjuntoExternalStayResponse {
  stayId: string;

  inmueble: {
    id: string;
    nombre: string;
    unidad?: string;
    apartamento?: string;
    torre?: string;
  };

  plataforma: string;

  huesped: {
    nombre: string;
    email: string;
  };

  fechas: {
    entrada: string;
    salida: string;
  };

  huespedes: number;
  estado: "PENDING" | "PAID" | "CANCELLED";

  codigoAcceso: string | null;
  accesoRevocado: boolean;

  /** La estadía cubre el día de hoy: el huésped está dentro del conjunto. */
  estaHoy: boolean;
}
