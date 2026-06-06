export interface AdminFeeResponse {
  id: string;
  amount: number;
  dueDate: string;
  type: string;
  customName?: string;
  description?: string;
  status: string;
  valuepay?: string | null;
  file?: string | null;
  paidAt?: string | null;
  approvedAt?: string | null;
}
