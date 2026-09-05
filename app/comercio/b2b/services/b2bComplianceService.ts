import { comercioFetch } from "../../_lib/comercio-api";

/**
 * Cumplimiento documental del proveedor.
 *
 * Un conjunto que lo contrata responde solidariamente por él, así que tener
 * ARL y póliza al día no es papeleo: es lo que decide si un administrador lo
 * deja entrar al edificio.
 */

export type B2bDocumentType =
  | "rut"
  | "camara_comercio"
  | "arl"
  | "poliza_rc"
  | "poliza_cumplimiento"
  | "seguridad_social"
  | "certificado_bancario"
  | "certificado_tecnico"
  | "otro";

export type B2bDocumentStatus = "pending" | "approved" | "rejected";

/** Debe coincidir con el mínimo que valida el backend. */
export const DOCUMENT_REJECTION_REASON_MIN = 10;

export const DOCUMENT_STATUS_LABELS: Record<B2bDocumentStatus, string> = {
  pending: "En revisión",
  approved: "Aprobado",
  rejected: "Rechazado",
};

export const DOCUMENT_STATUS_TONE: Record<B2bDocumentStatus, string> = {
  pending: "text-amber-300",
  approved: "text-emerald-400",
  rejected: "text-red-400",
};

export interface B2bDocument {
  id: string;
  type: B2bDocumentType;
  typeOther: string | null;
  /** Nombre del tipo, o el texto libre si es "otro". */
  label: string;
  fileName: string;
  documentNumber: string | null;
  issuer: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  /** Negativo si ya venció. Null en los que no vencen. */
  daysToExpiry: number | null;
  expired: boolean;
  /** Aprobado y sin vencer: lo único que cuenta para el sello. */
  current: boolean;
  requiredForVerification: boolean;
  status: B2bDocumentStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  notes: string | null;
  createdAt: string;
}

/** Regla de cada tipo, tal como la define el backend. */
export interface B2bDocumentRule {
  type: B2bDocumentType;
  label: string;
  requiredForVerification: boolean;
  expires: boolean;
  hint: string;
}

export interface B2bComplianceStatus {
  verified: boolean;
  missing: B2bDocumentType[];
  expiringSoon: { type: B2bDocumentType; expiresAt: string; days: number }[];
  pendingReview: number;
}

export interface B2bCompliancePayload {
  items: B2bDocument[];
  status: B2bComplianceStatus;
  rules: B2bDocumentRule[];
}

export function getCompliance() {
  return comercioFetch<B2bCompliancePayload>("/comercio/b2b/compliance");
}

export interface UploadDocumentInput {
  type: B2bDocumentType;
  typeOther?: string;
  documentNumber?: string;
  issuer?: string;
  issuedAt?: string;
  expiresAt?: string;
  notes?: string;
  file: File;
}

/**
 * Sube el soporte. Va como multipart y **sin** cabecera `Content-Type`: el
 * navegador tiene que ponerla él para incluir el `boundary`, y fijarla a mano
 * rompe la petición.
 */
export function uploadDocument(data: UploadDocumentInput) {
  const form = new FormData();
  form.append("file", data.file);
  form.append("type", data.type);

  const optional: [string, string | undefined][] = [
    ["typeOther", data.typeOther],
    ["documentNumber", data.documentNumber],
    ["issuer", data.issuer],
    ["issuedAt", data.issuedAt],
    ["expiresAt", data.expiresAt],
    ["notes", data.notes],
  ];

  for (const [key, value] of optional) {
    if (value) form.append(key, value);
  }

  return comercioFetch<B2bDocument>("/comercio/b2b/compliance", {
    method: "POST",
    body: form,
  });
}

export function deleteDocument(id: string) {
  return comercioFetch<{ success: boolean }>(
    `/comercio/b2b/compliance/${id}`,
    { method: "DELETE" },
  );
}

/**
 * URL de descarga del propio soporte.
 *
 * Va por el proxy del dominio comercio y no directo a la API: el token vive en
 * una cookie httpOnly que solo el servidor de Next puede leer, así que un
 * enlace a la API a secas llegaría sin credenciales. Como el proxy reenvía el
 * cuerpo tal cual y conserva el `Content-Disposition`, un `<a href>` normal
 * basta para descargar.
 */
export function documentFileUrl(id: string) {
  return `/api/comercio/proxy/api/comercio/b2b/compliance/${id}/file`;
}
