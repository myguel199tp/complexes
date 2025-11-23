export interface CreateAdminPayFeeRequest {
  relationId: string;
  adminFeeId: string;
  month: number;
  year: string;
  amount: string;
  status: "pending" | "paid" | "late";
}
