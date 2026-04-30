export interface ContractPaymentResponse {
  id: number;

  month: number;
  year: number;

  amount: number;

  paid: boolean;
  paidAt?: string | null;

  dueDate: string; // 🔥 importante para UI

  status: "PAID" | "PENDING" | "OVERDUE";
}
