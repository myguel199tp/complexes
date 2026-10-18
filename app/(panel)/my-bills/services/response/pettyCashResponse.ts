import { ExpenseResponse } from "./expenseResponse";

/** Una recarga de la caja menor. */
export interface PettyCashAssignment {
  id: string;
  amount: string;
  note: string | null;
  source: "council" | "designated";
  assignedByName: string | null;
  createdAt: string;
}

/** `GET /petty-cash`: lo que ven la administración y el aprobador. */
export interface PettyCashSummary {
  assigned: number;
  spent: number;
  balance: number;
  lastAssignment: number | null;
  /** Solo quien aprueba los gastos recarga la caja menor. */
  canAssign: boolean;
  approver: { source: "council" | "designated"; name: string | null } | null;
  assignments: PettyCashAssignment[];
  expenses: (ExpenseResponse & {
    created_at: string;
    createdByName?: string | null;
  })[];
}
