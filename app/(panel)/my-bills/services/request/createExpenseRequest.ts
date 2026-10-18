export interface CreateExpenseRequest {
  concept: string;
  amount: number;
  /** Solo se puede cambiar en un gasto ya pagado. */
  paymentDate?: string;
  period: string;
  categoryId: string;
  observations?: string;
}
