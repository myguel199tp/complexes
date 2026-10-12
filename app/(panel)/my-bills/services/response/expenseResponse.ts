export interface ExpenseResponse {
  id: string;
  concept: string;
  amount: string;
  paymentDate: string;
  period: string;
  observations?: string;

  /** Nulo cuando el gasto no requería aprobación al registrarse. */
  approvalStatus?: "pending" | "approved" | "rejected" | null;
  reviewComment?: string | null;
  reviewedAt?: string | null;
  reviewedByName?: string | null;

  category: {
    id: string;
    name: string;
  };
}
