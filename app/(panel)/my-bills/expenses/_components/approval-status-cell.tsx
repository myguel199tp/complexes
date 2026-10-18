import { ExpenseResponse } from "../../services/response/expenseResponse";

const STATUS: Record<
  "pending" | "approved" | "rejected",
  { label: string; className: string }
> = {
  pending: {
    label: "Por aprobar",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  },
  approved: {
    label: "Aprobado",
    className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  },
  rejected: {
    label: "Rechazado",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
  },
};

/** Estado de la aprobación del presidente, con quién respondió y el motivo. */
export default function ApprovalStatusCell({ expense }: { expense: ExpenseResponse }) {
  if (expense.pettyCash) {
    return (
      <div className="flex flex-col gap-1 text-xs">
        <span className="w-fit rounded-full bg-cyan-100 px-2 py-0.5 font-semibold text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200">
          Caja menor
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          Sin aprobación: dentro del saldo asignado
        </span>
      </div>
    );
  }

  if (!expense.approvalStatus) {
    return (
      <span className="text-xs text-gray-400 dark:text-gray-500">
        No requería aprobación
      </span>
    );
  }

  const status = STATUS[expense.approvalStatus];

  return (
    <div className="flex flex-col gap-1 text-xs">
      <span
        className={`w-fit rounded-full px-2 py-0.5 font-semibold ${status.className}`}
      >
        {status.label}
      </span>
      {expense.reviewedByName && (
        <span className="text-gray-500 dark:text-gray-400">
          {expense.reviewedByName}
          {expense.reviewedAt &&
            ` · ${new Date(expense.reviewedAt).toLocaleDateString("es-CO")}`}
        </span>
      )}
      {expense.reviewComment && (
        <span className="text-gray-700 italic dark:text-gray-300">
          “{expense.reviewComment}”
        </span>
      )}
    </div>
  );
}
