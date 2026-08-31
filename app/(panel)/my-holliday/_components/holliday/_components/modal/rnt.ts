/**
 * Registro Nacional de Turismo (Colombia).
 *
 * La Ley 300 de 1996 obliga a todo prestador de alojamiento turístico a estar
 * inscrito en el RNT antes de ofertar, así que el número se pide al publicar
 * —el acto que pone el inmueble a la venta— y no al crear el borrador.
 *
 * Lo que se valida aquí es solo el formato, para no dejar enviar el formulario
 * a medias. Que el número sea real lo decide el backend cruzándolo contra el
 * registro público que publica MinCIT: un regex nunca distinguió un RNT de una
 * cifra inventada, y por eso también se pide el documento del titular.
 */

/**
 * El campo `country` del holiday no guarda un valor único: el formulario
 * escribe el `code` de `countries-complexes` ("CO"), registros más viejos
 * traen el `ids` numérico (200) y algunos el nombre.
 */
const COLOMBIA_VALUES = new Set(["co", "col", "200", "colombia"]);

export function requiresRnt(country?: string | null): boolean {
  return !!country && COLOMBIA_VALUES.has(String(country).trim().toLowerCase());
}

/** Trámite oficial en Confecámaras, para el anfitrión que aún no lo tiene. */
export const RNT_SIGNUP_URL = "https://rnt.confecamaras.co/";

/** El `codigo_rnt` del registro es un entero secuencial: solo dígitos. */
export const RNT_PATTERN = /^\d{1,20}$/;

/** NIT o cédula del titular, sin puntos ni dígito de verificación obligatorio. */
export const RNT_DOCUMENT_PATTERN = /^\d{5,20}$/;

/** Se comparan por dígitos, así que se limpia lo que el anfitrión pegue del RUT. */
export const onlyDigits = (value: string): string => value.replace(/\D/g, "");

/**
 * Códigos que devuelve `publishHolliday` cuando el cruce falla. Se distinguen
 * porque cada uno pide una salida distinta: renovar, corregir el titular o
 * escribirle a soporte.
 */
export const RNT_ERROR_HINTS: Record<string, string> = {
  RNT_NOT_FOUND:
    "Revisa el número: debe ser el mismo que aparece en tu certificado del RNT.",
  RNT_EXPIRED:
    "Tu RNT no aparece vigente este año. Renuévalo en Confecámaras y vuelve a publicar.",
  RNT_MISMATCH:
    "El número y el documento del titular no coinciden con el registro. Usa el documento con el que inscribiste el RNT.",
  RNT_ALREADY_CLAIMED:
    "Ese RNT ya está en uso por otra cuenta. Si es tuyo, escríbenos para revisarlo.",
};
