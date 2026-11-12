import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = (conjuntoId: string) => ({
  "Content-Type": "application/json",
  "x-conjunto-id": conjuntoId,
});

export type LegalCaseStatus =
  | "PREJURIDICO"
  | "JURIDICO"
  | "DEMANDADO"
  | "ACUERDO"
  | "CERRADO";

export type LegalCaseClosureReason =
  | "PAGO_TOTAL"
  | "ACUERDO_CUMPLIDO"
  | "DESISTIMIENTO"
  | "INCOBRABLE"
  | "ERROR";

/**
 * Etapas que el administrador puede elegir al trasladar.
 *
 * `ACUERDO` lo asigna el módulo de acuerdos de pago y `CERRADO` va por el
 * cierre, que exige motivo, así que ninguno de los dos se abre a mano.
 */
export const OPENABLE_STATUSES: {
  value: LegalCaseStatus;
  label: string;
  hint: string;
}[] = [
  {
    value: "PREJURIDICO",
    label: "Prejurídico",
    hint: "Cobro persuasivo de la administración, sin abogado. Al residente se le dice que todavía puede ponerse al día o pedir un acuerdo de pago.",
  },
  {
    value: "JURIDICO",
    label: "Jurídico",
    hint: "El caso lo lleva el abogado del conjunto. Al residente le llega el nombre y el contacto del abogado para que se ponga al día con él.",
  },
  {
    value: "DEMANDADO",
    label: "Demandado",
    hint: "La demanda ya está radicada ante el juzgado. Además del abogado, se registra el radicado y se le informa al residente.",
  },
];

/**
 * Lo que exige cada etapa; el backend lo valida igual. Prejurídico no lleva
 * abogado; jurídico, abogado con correo o teléfono; demandado, además el
 * radicado.
 */
export const STAGE_NEEDS_LAWYER: Partial<Record<LegalCaseStatus, boolean>> = {
  JURIDICO: true,
  DEMANDADO: true,
};

export const STAGE_NEEDS_CASE_REF: Partial<Record<LegalCaseStatus, boolean>> = {
  DEMANDADO: true,
};

/** Qué le falta a una etapa, o `null` si está completa. */
export function missingForStage(
  status: LegalCaseStatus,
  data: {
    lawyerName?: string;
    lawyerEmail?: string;
    lawyerPhone?: string;
    externalCaseRef?: string;
  },
): string | null {
  if (STAGE_NEEDS_LAWYER[status]) {
    if (!data.lawyerName?.trim()) return "Indica el abogado que lleva el caso";
    if (!data.lawyerEmail?.trim() && !data.lawyerPhone?.trim()) {
      return "Indica el correo o el teléfono del abogado: es como el residente se comunica con él";
    }
  }

  if (STAGE_NEEDS_CASE_REF[status] && !data.externalCaseRef?.trim()) {
    return "Indica el radicado del juzgado";
  }

  return null;
}

/** El caso del propio residente, como lo ve en su perfil. */
export interface MyLegalCase {
  id: string;
  status: LegalCaseStatus;
  statusLabel: string;
  unit: string;
  openedAt: string;
  /** Lo que debe hoy, no lo que debía al trasladar. */
  outstanding: number;
  title: string;
  message: string;
  /** Solo en jurídico y demandado. */
  lawyer: { name: string | null; email: string | null; phone: string | null } | null;
  externalCaseRef: string | null;
}

export const CLOSURE_REASONS: {
  value: LegalCaseClosureReason;
  label: string;
}[] = [
  { value: "PAGO_TOTAL", label: "Pagó la totalidad" },
  { value: "ACUERDO_CUMPLIDO", label: "Cumplió el acuerdo de pago" },
  { value: "DESISTIMIENTO", label: "El conjunto desistió" },
  { value: "INCOBRABLE", label: "Declarada incobrable" },
  { value: "ERROR", label: "Traslado por error" },
];

export const LEGAL_STATUS_LABEL: Record<LegalCaseStatus, string> = {
  PREJURIDICO: "Prejurídico",
  JURIDICO: "Jurídico",
  DEMANDADO: "Demandado",
  ACUERDO: "Con acuerdo de pago",
  CERRADO: "Cerrado",
};

export interface LegalCase {
  id: string;
  relationId: string;
  status: LegalCaseStatus;
  statusLabel: string;
  isOpen: boolean;
  unit: {
    tower: string | null;
    apartment: string | null;
    label: string;
    resident: string;
    email: string | null;
    phone: string | null;
  };
  debtSnapshot: number;
  daysOverdueAtOpen: number;
  feesSnapshot: string[];
  lawyerName: string | null;
  lawyerEmail: string | null;
  lawyerPhone: string | null;
  externalCaseRef: string | null;
  notes: string | null;
  openedAt: string;
  openedByName: string | null;
  /** Caso heredado de antes de la plataforma. */
  isMigrated: boolean;
  closedAt: string | null;
  closureReason: LegalCaseClosureReason | null;
  closureLabel: string | null;
}

export interface LegalCaseListResponse {
  summary: {
    total: number;
    open: number;
    /** Suma de la deuda congelada al abrir cada caso vivo. */
    debtSnapshot: number;
    byStatus: Record<LegalCaseStatus, number>;
  };
  cases: LegalCase[];
}

export interface OpenLegalCaseBody {
  status?: LegalCaseStatus;
  reason: string;
  lawyerName?: string;
  lawyerEmail?: string;
  lawyerPhone?: string;
  externalCaseRef?: string;

  /**
   * Fecha real de apertura, "yyyy-MM-dd". Por defecto, ahora.
   *
   * Es para migraciones: una unidad que llega con el cobro andando desde hace
   * un año quedaba registrada como abierta el día de la carga. No puede ser
   * futura.
   */
  openedAt?: string;

  /**
   * El proceso ya existía antes de entrar a la plataforma.
   *
   * Silencia el aviso al residente —ya sabe que está en cobro— y hace que la
   * bitácora lo registre como expediente heredado.
   */
  isMigrated?: boolean;
}

/**
 * Cobro jurídico.
 *
 * El escalamiento existía solo como decisión humana fuera de la plataforma: se
 * tomaba mirando el tramo de +120 días de la cartera y no quedaba registrado en
 * ninguna parte.
 */
export class LegalCollectionService {
  static async list(
    conjuntoId: string,
    filters: { status?: LegalCaseStatus; includeClosed?: boolean } = {},
  ): Promise<LegalCaseListResponse> {
    const params = new URLSearchParams();

    if (filters.status) params.set("status", filters.status);
    if (filters.includeClosed) params.set("includeClosed", "true");

    const query = params.toString();

    const res = await fetchWithAuth(
      `${BASE_URL}/api/admin-fee/legal${query ? `?${query}` : ""}`,
      { method: "GET", headers: getHeaders(conjuntoId) },
    );

    if (!res.ok) {
      throw await backendError(res);
    }

    return res.json();
  }

  /** El caso de cobro del residente, si tiene uno abierto. */
  static async mine(conjuntoId: string): Promise<MyLegalCase[]> {
    const res = await fetchWithAuth(`${BASE_URL}/api/admin-fee/legal/mine`, {
      method: "GET",
      headers: getHeaders(conjuntoId),
    });

    if (!res.ok) {
      throw await backendError(res);
    }

    return res.json();
  }

  /** Trasladar una unidad a cobro. Siempre manual. */
  static async open(
    relationId: string,
    conjuntoId: string,
    body: OpenLegalCaseBody,
  ): Promise<LegalCase> {
    const res = await fetchWithAuth(
      `${BASE_URL}/api/admin-fee/legal/unit/${relationId}`,
      {
        method: "POST",
        headers: getHeaders(conjuntoId),
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      throw await backendError(res);
    }

    return res.json();
  }

  static async update(
    caseId: string,
    conjuntoId: string,
    body: Partial<OpenLegalCaseBody> & { note?: string },
  ): Promise<LegalCase> {
    const res = await fetchWithAuth(`${BASE_URL}/api/admin-fee/legal/${caseId}`, {
      method: "PATCH",
      headers: getHeaders(conjuntoId),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw await backendError(res);
    }

    return res.json();
  }

  static async close(
    caseId: string,
    conjuntoId: string,
    body: { closureReason: LegalCaseClosureReason; note?: string },
  ): Promise<LegalCase> {
    const res = await fetchWithAuth(
      `${BASE_URL}/api/admin-fee/legal/${caseId}/close`,
      {
        method: "POST",
        headers: getHeaders(conjuntoId),
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      throw await backendError(res);
    }

    return res.json();
  }
}
