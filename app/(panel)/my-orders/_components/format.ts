/** Formatos compartidos por las vistas de pedidos y citas. */

export function money(value: number | string): string {
  return `$${Number(value).toLocaleString("es-CO")}`;
}

/** "3 ago, 2:00 p. m." — la hora importa en las citas, no en los pedidos. */
export function dateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function dateOnly(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
