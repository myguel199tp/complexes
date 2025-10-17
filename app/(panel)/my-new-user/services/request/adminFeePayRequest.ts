export interface CreateAdminPayFeeRequest {
  adminFeeId: string;
  month: number;
  year: string;
  amount: string;
  status: "pending" | "paid" | "late";
}
