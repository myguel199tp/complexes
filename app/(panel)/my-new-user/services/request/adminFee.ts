export interface CreateAdminFeeRequest {
  relationId: string;
  amount: number;
  dueDate: string;
  paidAt: string;
  status: "pending" | "paid" | "late";
}
