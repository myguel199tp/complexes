export interface ContractSummaryResponse {
  contractId: number;

  totalExpected: number; // 💰 total del contrato
  totalPaid: number; // ✅ lo que ya pagaron
  totalPending: number; // ❌ lo que falta

  paymentsPaid: number; // cantidad pagos pagados
  paymentsPending: number; // cantidad pendientes

  nextPayment?: {
    id: number;
    month: number;
    year: number;
    amount: number;
    dueDate: string;
  } | null;
}
