import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = (conjuntoId: string) => ({
  "Content-Type": "application/json",
  "x-conjunto-id": conjuntoId,
});

/**
 * La clave es el banco, no la plataforma: los cuatro del grupo Aval recaudan
 * por AvalPay Center pero cada uno firma su convenio aparte, con su código y su
 * cuenta. Espeja el enum del backend.
 */
export enum CollectionProvider {
  CAJA_SOCIAL = "CAJA_SOCIAL",
  DAVIVIENDA = "DAVIVIENDA",
  BANCOLOMBIA = "BANCOLOMBIA",
  BANCO_BOGOTA = "BANCO_BOGOTA",
  BANCO_OCCIDENTE = "BANCO_OCCIDENTE",
  BANCO_POPULAR = "BANCO_POPULAR",
  AV_VILLAS = "AV_VILLAS",
  BBVA = "BBVA",
  ITAU = "ITAU",
  SCOTIABANK_COLPATRIA = "SCOTIABANK_COLPATRIA",
  GENERIC = "GENERIC",
}

export const PROVIDER_BANK: Record<CollectionProvider, string> = {
  [CollectionProvider.CAJA_SOCIAL]: "Banco Caja Social",
  [CollectionProvider.DAVIVIENDA]: "Davivienda",
  [CollectionProvider.BANCOLOMBIA]: "Bancolombia",
  [CollectionProvider.BANCO_BOGOTA]: "Banco de Bogotá",
  [CollectionProvider.BANCO_OCCIDENTE]: "Banco de Occidente",
  [CollectionProvider.BANCO_POPULAR]: "Banco Popular",
  [CollectionProvider.AV_VILLAS]: "AV Villas",
  [CollectionProvider.BBVA]: "BBVA Colombia",
  [CollectionProvider.ITAU]: "Itaú",
  [CollectionProvider.SCOTIABANK_COLPATRIA]: "Scotiabank Colpatria",
  [CollectionProvider.GENERIC]: "Otro banco",
};

/** La plataforma donde termina pagando el residente. Se repite entre bancos. */
export const PROVIDER_PLATFORM: Record<CollectionProvider, string> = {
  [CollectionProvider.CAJA_SOCIAL]: "Mi Pago Amigo",
  [CollectionProvider.DAVIVIENDA]: "Jelpit",
  [CollectionProvider.BANCOLOMBIA]: "Tu360 Inmobiliario / Recaudo Bancolombia",
  [CollectionProvider.BANCO_BOGOTA]: "AvalPay Center",
  [CollectionProvider.BANCO_OCCIDENTE]: "AvalPay Center",
  [CollectionProvider.BANCO_POPULAR]: "AvalPay Center",
  [CollectionProvider.AV_VILLAS]: "AvalPay Center",
  [CollectionProvider.BBVA]: "Zona Pagos",
  [CollectionProvider.ITAU]: "Itaú Pagos / Convenios",
  [CollectionProvider.SCOTIABANK_COLPATRIA]: "Convenios / Recaudo",
  [CollectionProvider.GENERIC]: "Convenio de recaudo",
};

export const PROVIDER_LABEL: Record<CollectionProvider, string> = Object.values(
  CollectionProvider,
).reduce(
  (labels, provider) => ({
    ...labels,
    [provider]: `${PROVIDER_BANK[provider]} — ${PROVIDER_PLATFORM[provider]}`,
  }),
  {} as Record<CollectionProvider, string>,
);

export enum CollectionFileFormat {
  ASOBANCARIA_2001 = "ASOBANCARIA_2001",
  ASOBANCARIA_2011 = "ASOBANCARIA_2011",
  BANCOLOMBIA = "BANCOLOMBIA",
  CSV_CUSTOM = "CSV_CUSTOM",
}

export enum ReferenceCheckDigit {
  NONE = "NONE",
  MOD_10 = "MOD_10",
  MOD_11 = "MOD_11",
}

export interface CollectionAgreement {
  id: string;
  conjuntoId: string;
  provider: CollectionProvider;
  displayName?: string;
  agreementCode: string;
  bankAccountId?: string | null;
  referencePrefix: string;
  referenceLength: number;
  checkDigit: ReferenceCheckDigit;
  fileFormat?: CollectionFileFormat | null;
  paymentChannels: string[];
  instructions?: string | null;
  paymentUrl?: string | null;
  isActive: boolean;
  /** Cuántas unidades ya tienen referencia emitida en este convenio. */
  issuedReferences: number;
  createdAt: string;
}

export interface CreateCollectionAgreementDto {
  provider: CollectionProvider;
  displayName?: string;
  agreementCode: string;
  bankAccountId?: string;
  referencePrefix?: string;
  referenceLength?: number;
  checkDigit?: ReferenceCheckDigit;
  fileFormat?: CollectionFileFormat;
  paymentChannels?: string[];
  instructions?: string;
  paymentUrl?: string;
  isActive?: boolean;
}

export interface CollectionUnitReference {
  id: string;
  tower?: string | null;
  apartment: string;
  unitCode: number;
  reference: string;
}

export interface GenerateReferencesResponse {
  message: string;
  units: number;
  created: number;
  total: number;
}

/**
 * El backend devuelve el motivo del rechazo en el cuerpo —formato sin espacio
 * para el consecutivo, convenio duplicado, cambio de formato con referencias ya
 * emitidas—, y son mensajes que el administrador necesita leer tal cual para
 * corregir el formulario.
 */
function messageFrom(body: string, status: number): string {
  try {
    const parsed = JSON.parse(body);

    return Array.isArray(parsed.message)
      ? parsed.message.join(", ")
      : (parsed.message ?? body);
  } catch {
    // Cuerpo vacío o que no es JSON —un 204, una página de error del proxy—:
    // el texto crudo no le dice nada al administrador, y `res.json()` sobre él
    // reventaba con "Failed to execute 'json' on 'Response'".
    return (
      body.trim() ||
      `El servidor respondió ${status} sin detalle. Vuelve a intentarlo.`
    );
  }
}

/**
 * Se lee el cuerpo una sola vez como texto y se parsea a mano. `res.json()`
 * sobre una respuesta sin cuerpo —un 204, o un 200 que se quedó vacío— lanza
 * "Failed to execute 'json' on 'Response': Unexpected end of JSON input", que
 * es lo que terminaba en el cuadro de error del formulario en vez de un
 * mensaje que el administrador pueda accionar.
 */
async function unwrap<T>(res: Response): Promise<T> {
  const body = await res.text();

  if (!res.ok) throw new Error(messageFrom(body, res.status));

  if (!body.trim()) {
    throw new Error(
      `El servidor respondió ${res.status} sin contenido. Refresca la página para ver si el cambio quedó guardado.`,
    );
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error("El servidor devolvió una respuesta que no se pudo leer.");
  }
}

export class CollectionAgreementService {
  static async list(conjuntoId: string): Promise<CollectionAgreement[]> {
    return unwrap(
      await fetchWithAuth(`${BASE_URL}/api/collection-agreements`, {
        method: "GET",
        headers: getHeaders(conjuntoId),
      }),
    );
  }

  static async create(
    data: CreateCollectionAgreementDto,
    conjuntoId: string,
  ): Promise<CollectionAgreement> {
    return unwrap(
      await fetchWithAuth(`${BASE_URL}/api/collection-agreements`, {
        method: "POST",
        headers: getHeaders(conjuntoId),
        body: JSON.stringify(data),
      }),
    );
  }

  static async update(
    id: string,
    data: Partial<CreateCollectionAgreementDto>,
    conjuntoId: string,
  ): Promise<CollectionAgreement> {
    return unwrap(
      await fetchWithAuth(`${BASE_URL}/api/collection-agreements/${id}`, {
        method: "PATCH",
        headers: getHeaders(conjuntoId),
        body: JSON.stringify(data),
      }),
    );
  }

  static async remove(id: string, conjuntoId: string): Promise<void> {
    const res = await fetchWithAuth(
      `${BASE_URL}/api/collection-agreements/${id}`,
      { method: "DELETE", headers: getHeaders(conjuntoId) },
    );

    if (!res.ok) throw new Error(messageFrom(await res.text(), res.status));
  }

  static async generateReferences(
    id: string,
    conjuntoId: string,
  ): Promise<GenerateReferencesResponse> {
    return unwrap(
      await fetchWithAuth(
        `${BASE_URL}/api/collection-agreements/${id}/generate-references`,
        { method: "POST", headers: getHeaders(conjuntoId) },
      ),
    );
  }

  static async listReferences(
    id: string,
    conjuntoId: string,
  ): Promise<CollectionUnitReference[]> {
    return unwrap(
      await fetchWithAuth(
        `${BASE_URL}/api/collection-agreements/${id}/references`,
        { method: "GET", headers: getHeaders(conjuntoId) },
      ),
    );
  }
}
