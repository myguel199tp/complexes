import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import type { LegalCaseStatus } from "./legalCollectionService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = (conjuntoId: string) => ({
  "Content-Type": "application/json",
  "x-conjunto-id": conjuntoId,
});

/** Antigüedad de la deuda por tramos, el corte estándar de cartera. */
export interface Aging {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days90plus: number;
}

export interface PortfolioUnit {
  relationId: string;
  tower?: string | null;
  apartment?: string | null;
  resident: string;
  email?: string | null;
  phone?: string | null;
  outstanding: number;
  overdue: number;
  mora: number;
  inReview: number;
  feesCount: number;
  oldestDueDate: string | null;
  daysOverdue: number;
  aging: Aging;

  /** Proceso de cobro abierto sobre la unidad, si lo hay. */
  legalCase: {
    id: string;
    status: LegalCaseStatus;
    statusLabel: string;
    openedAt: string;
  } | null;

  /**
   * Supera el corte que fijó el conjunto y todavía no se ha trasladado. Es una
   * sugerencia: el traslado siempre lo decide una persona.
   */
  legalCandidate: boolean;
}

export interface Portfolio {
  summary: {
    units: number;
    outstanding: number;
    overdue: number;
    mora: number;
    inReview: number;
    /** Deuda de las unidades que ya están en cobro jurídico. */
    inLegal: number;
    legalCases: number;
    legalCandidates: number;
    /** Corte configurado por el conjunto; null si no se fijó ninguno. */
    legalThresholdDays: number | null;
    aging: Aging;
  };
  units: PortfolioUnit[];
  towers: string[];
}

export interface PortfolioFilters {
  tower?: string;
  minDaysOverdue?: number;
  minAmount?: number;
  search?: string;
}

export class PortfolioService {
  /**
   * Cartera del conjunto, agregada por unidad.
   *
   * Antes el dashboard se traía todas las cuotas del conjunto y las sumaba en
   * el navegador: en una copropiedad de 300 apartamentos con un año de
   * historia son varios miles de filas en cada carga.
   */
  static async get(
    conjuntoId: string,
    filters: PortfolioFilters = {},
  ): Promise<Portfolio> {
    const params = new URLSearchParams();

    if (filters.tower) params.set("tower", filters.tower);
    if (filters.minDaysOverdue) {
      params.set("minDaysOverdue", String(filters.minDaysOverdue));
    }
    if (filters.minAmount) params.set("minAmount", String(filters.minAmount));
    if (filters.search) params.set("search", filters.search);

    const query = params.toString();

    const res = await fetchWithAuth(
      `${BASE_URL}/api/admin-fee/portfolio${query ? `?${query}` : ""}`,
      { method: "GET", headers: getHeaders(conjuntoId) },
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  }

  /** Insistirle a un moroso concreto, con su saldo al día. */
  static async remindUnit(
    relationId: string,
    conjuntoId: string,
    note?: string,
  ) {
    const res = await fetchWithAuth(
      `${BASE_URL}/api/admin-fee/unit/${relationId}/remind`,
      {
        method: "POST",
        headers: getHeaders(conjuntoId),
        body: JSON.stringify({ note }),
      },
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  }

  /**
   * Gestión de cobro masiva. `minDaysOverdue` es obligatorio: sin él se le
   * escribiría a todo el que deba un peso, incluida la cuota de ayer.
   */
  static async remindPortfolio(
    conjuntoId: string,
    body: { minDaysOverdue: number; tower?: string; note?: string },
  ): Promise<{
    sent: number;
    targeted: number;
    failed: { apartment?: string; reason: string }[];
  }> {
    const res = await fetchWithAuth(
      `${BASE_URL}/api/admin-fee/portfolio/remind`,
      {
        method: "POST",
        headers: getHeaders(conjuntoId),
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  }
}
