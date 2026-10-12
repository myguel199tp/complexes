export type ExpenseApprovalStatus = "pending" | "approved" | "rejected";

/** De dónde sale quien aprueba: el presidente del consejo o el designado. */
export type ExpenseApproverSource = "council" | "designated";

export interface ExpenseOwner {
  userId: string;
  name: string | null;
  tower: string | null;
  apartment: string | null;
}

/** `GET /expense-approvals/approver`: lo que ve la administración. */
export interface ExpenseApproverSettings {
  source: ExpenseApproverSource | null;
  /** Con presidente del consejo (Platino) no se designa a nadie más. */
  lockedByCouncil: boolean;
  approver: ExpenseOwner | null;
  /** El designado, aunque ya no sea propietario activo (`active: false`). */
  designated: (ExpenseOwner & { active: boolean }) | null;
  pendingCount: number;
}

/** `GET /expense-approvals/me`: si quien pregunta aprueba los gastos. */
export interface MyExpenseApproverStatus {
  isApprover: boolean;
  source: ExpenseApproverSource | null;
  pendingCount: number;
}

/** Un gasto tal como lo ve el aprobador. */
export interface ApprovalExpense {
  id: string;
  concept: string;
  amount: string;
  paymentDate: string;
  period: string;
  observations?: string | null;
  category?: { id: string; name: string } | null;
  approvalStatus: ExpenseApprovalStatus | null;
  reviewedAt: string | null;
  reviewComment: string | null;
  hasFile: boolean;
  createdByName: string | null;
  reviewedByName: string | null;
  created_at: string;
}

/** Una respuesta del aprobador, con el concepto y el monto que vio. */
export interface ApproverHistoryReview {
  id: string;
  expenseId: string;
  decision: "approved" | "rejected";
  comment: string | null;
  reviewedAt: string;
  concept: string;
  amount: string;
  category: string | null;
  paymentDate: string | null;
  period: string | null;
  /** El gasto se eliminó después de responderse. */
  deleted: boolean;
  /** El gasto se corrigió después: ya no es lo que se respondió. */
  changedSince: boolean;
}

/** `GET /expense-approvals/history`: un periodo de un aprobador. */
export interface ApproverHistoryTerm {
  id: string;
  userId: string;
  name: string | null;
  tower: string | null;
  apartment: string | null;
  /** Nulo en respuestas anteriores al registro de periodos. */
  source: ExpenseApproverSource | null;
  startedAt: string | null;
  endedAt: string | null;
  current: boolean;
  approvedCount: number;
  rejectedCount: number;
  reviews: ApproverHistoryReview[];
}

/** `GET /expense-approvals/history`. */
export interface ApproverHistoryResult {
  /** Días visibles en Básico; nulo si el plan trae el historial completo. */
  limitedToDays: number | null;
  /** Respuestas anteriores a la ventana, que se ven al subir de plan. */
  hiddenReviews: number;
  hiddenTerms: number;
  terms: ApproverHistoryTerm[];
}
