const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * URL pública de un archivo subido.
 *
 * Cada pantalla armaba la suya quedándose con el nombre del archivo y
 * descartando el directorio. Eso funcionó mientras todo caía en la misma
 * carpeta plana, pero al organizar las subidas por módulo —uploads/holliday,
 * uploads/comercio, uploads/news…— ese recorte deja la URL apuntando a la raíz
 * y el archivo da 404.
 *
 * Aquí se conserva la ruta relativa a la carpeta de subidas, que es justo lo
 * que distingue una carpeta de otra. Sirve para las tres formas que conviven en
 * la base de datos, porque lo que hace es quedarse con lo que venga después del
 * último separador de la carpeta raíz:
 *
 *   uploads\foto.png                 → /uploads/foto.png             (fila vieja)
 *   C:\allweb\...\uploads\foto.png   → /uploads/foto.png             (ruta absoluta vieja)
 *   uploads\holliday\foto.png        → /uploads/holliday/foto.png    (fila nueva)
 *
 * Por eso no hay que mover los archivos ya subidos: los viejos siguen sueltos
 * en la raíz y se resuelven igual.
 *
 * No sirve para comprobantes de pago ni documentos de identidad: esos no se
 * publican como estáticos y se piden por su endpoint autenticado (useFeeProof,
 * useVisitFile).
 */
export function fileUrl(stored?: string | null): string | null {
  if (!stored) return null;

  // multer en Windows devuelve "\", y esto termina dentro de una URL.
  const normalized = stored.replace(/\\/g, "/");

  const marker = "uploads/";
  const at = normalized.lastIndexOf(marker);

  const relative = at >= 0 ? normalized.slice(at + marker.length) : normalized;

  const clean = relative.replace(/^\/+/, "");

  if (!clean) return null;

  return BASE_URL + "/uploads/" + clean;
}
