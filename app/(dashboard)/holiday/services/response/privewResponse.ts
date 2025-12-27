export interface BookingPreviewResponse {
  subtotal: number; // Precio base sin descuentos ni impuestos
  discount: number; // Descuento aplicado (por ejemplo, promoción)
  taxes: number; // Impuestos calculados
  cleaningFee: number; // Tarifa de limpieza
  deposit: number; // Depósito de garantía
  total: number; // Total final incluyendo todo
}
