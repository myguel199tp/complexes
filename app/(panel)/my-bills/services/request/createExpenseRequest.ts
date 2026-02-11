export interface CreateExpenseRequest {
  concept: string;
  amount: number;
  paymentDate: string;
  period: string;
  categoryId: string;
  observations?: string;
}
