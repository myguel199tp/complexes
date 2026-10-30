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
 * useVisitFile). Tampoco para las carpetas protegidas —documentos, PQR—: esas
 * van por `protectedFileUrl`.
 */
export function fileUrl(stored?: string | null): string | null {
  const relative = uploadRelativePath(stored);

  return relative ? BASE_URL + "/uploads/" + relative : null;
}

/**
 * URL autenticada de un archivo de las carpetas que el backend ya no sirve como
 * estático: `records` (documentos del conjunto), `pqr`, `certifications`… Por
 * `/uploads/...` esas responden "Not found" aunque el archivo exista.
 *
 * Es la misma ruta con `/api` delante y exige sesión, así que no sirve en un
 * `<a href>` ni en un `<iframe>`: se pide con `fetchWithAuth`
 * (`useProtectedFile`, `openProtectedFile`).
 */
export function protectedFileUrl(stored?: string | null): string | null {
  const relative = uploadRelativePath(stored);

  if (!relative) return null;

  // Un archivo suelto en la raíz es de antes de las carpetas por módulo: la
  // raíz se sigue sirviendo como estático y el endpoint protegido exige
  // carpeta, así que ese va por la ruta de siempre.
  if (!relative.includes("/")) return BASE_URL + "/uploads/" + relative;

  return BASE_URL + "/api/uploads/" + relative;
}

function uploadRelativePath(stored?: string | null): string | null {
  if (!stored) return null;

  // multer en Windows devuelve "\", y esto termina dentro de una URL.
  const normalized = stored.replace(/\\/g, "/");

  const marker = "uploads/";
  const at = normalized.lastIndexOf(marker);

  const relative = at >= 0 ? normalized.slice(at + marker.length) : normalized;

  return relative.replace(/^\/+/, "") || null;
}
