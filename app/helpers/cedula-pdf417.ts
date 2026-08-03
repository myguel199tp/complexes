/**
 * Lectura del PDF417 del reverso de la cédula colombiana.
 *
 * El portero digitaba nombre y número de documento a mano en cada visita: unos
 * 40 segundos por persona, con los errores de transcripción que eso implica en
 * un registro que después sirve como bitácora de seguridad. El código de barras
 * trae los dos datos.
 *
 * El formato "PubDSK_1" es de campos fijos por posición. No está publicado
 * oficialmente, así que estas posiciones vienen de la práctica y pueden fallar
 * con cédulas de emisiones distintas: por eso `parseCedulaPdf417` devuelve
 * `null` en vez de adivinar, y el formulario queda editable para que el portero
 * corrija o escriba a mano.
 */

export interface CedulaData {
  numberId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  /** `M` | `F` cuando se puede leer. */
  gender?: string;
  birthDate?: string;
}

const MAGIC = "PubDSK";

/** Posiciones del layout de campos fijos. */
const FIELD = {
  document: [48, 58],
  lastName1: [58, 81],
  lastName2: [81, 104],
  firstName1: [104, 127],
  firstName2: [127, 150],
  gender: [151, 152],
  birthDate: [152, 160],
} as const;

/** El relleno viene con nulos y caracteres de control, no con espacios. */
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

const clean = (value: string) =>
  value.replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim();

const slice = (raw: string, [start, end]: readonly [number, number]) =>
  clean(raw.slice(start, end));

export function parseCedulaPdf417(raw: string): CedulaData | null {
  if (!raw || !raw.includes(MAGIC)) return null;

  // Algunos lectores anteponen bytes antes de la cabecera.
  const data = raw.slice(raw.indexOf(MAGIC));

  if (data.length < FIELD.birthDate[1]) return null;

  const document = slice(data, FIELD.document).replace(/\D/g, "");

  // Un documento colombiano vive entre 6 y 10 dígitos; fuera de ahí la lectura
  // se desalineó y es preferible no rellenar el formulario con basura.
  const numberId = document.replace(/^0+/, "");
  if (numberId.length < 6 || numberId.length > 10) return null;

  const lastName = clean(
    `${slice(data, FIELD.lastName1)} ${slice(data, FIELD.lastName2)}`,
  );
  const firstName = clean(
    `${slice(data, FIELD.firstName1)} ${slice(data, FIELD.firstName2)}`,
  );

  if (!firstName && !lastName) return null;

  const gender = slice(data, FIELD.gender).toUpperCase();
  const birthRaw = slice(data, FIELD.birthDate).replace(/\D/g, "");

  return {
    numberId,
    firstName,
    lastName,
    fullName: clean(`${firstName} ${lastName}`),
    gender: gender === "M" || gender === "F" ? gender : undefined,
    birthDate:
      birthRaw.length === 8
        ? `${birthRaw.slice(0, 4)}-${birthRaw.slice(4, 6)}-${birthRaw.slice(6, 8)}`
        : undefined,
  };
}
