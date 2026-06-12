export interface AdminReservaItem {
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

export interface AdminByConjuntoResponse {
  id: string;
  iduser: string;
  nombre: string;
  unidad: string;
  apartamento: string;
  torre: string;
  estado: string;
  disponibleDesde: string;
  disponibleHasta: string;
  estaAlquilado: boolean;
  reservas: AdminReservaItem[];
}
