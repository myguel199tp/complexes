export interface ExpenseResponse {
  id: string;
  concept: string;
  amount: string;
  paymentDate: string;
  period: string;
  observations?: string;

  category: {
    id: string;
    name: string;
  };
}
