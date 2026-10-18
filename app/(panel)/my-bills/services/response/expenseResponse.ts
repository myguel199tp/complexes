export interface ExpenseResponse {
  id: string;
  concept: string;
  amount: string;
  /** Nulo hasta que se marca como pagado. */
  paymentDate: string | null;
  period: string;
  observations?: string;

  /**
   * Aprobación antes del pago. Nulo cuando no hace falta: el conjunto no tiene
   * quién apruebe, el gasto entró ya pagado (B2B) o es anterior al cambio.
   */
  approvalStatus?: "pending" | "approved" | "rejected" | null;
  reviewComment?: string | null;
  reviewedAt?: string | null;
  reviewedByName?: string | null;

  /** Cuándo se marcó como pagado; solo lo pagado cuenta en los informes. */
  paidAt?: string | null;
  paidByName?: string | null;
  hasFile?: boolean;
  hasReceipt?: boolean;
  /** Pagado con la caja menor: entró pagado y sin aprobación. */
  pettyCash?: boolean;

  category: {
    id: string;
    name: string;
  };
}
