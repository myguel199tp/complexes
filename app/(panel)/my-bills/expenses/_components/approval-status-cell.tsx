import { ExpenseResponse } from "../../services/response/expenseResponse";

const STATUS: Record<
  "pending" | "approved" | "rejected",
  { label: string; className: string }
> = {
  pending: { label: "Por confirmar", className: "bg-amber-100 text-amber-800" },
  approved: { label: "Confirmado", className: "bg-green-100 text-green-800" },
  rejected: { label: "Negado", className: "bg-red-100 text-red-700" },
};

/** Estado de la confirmación del presidente, con quién respondió y el motivo. */
export default function ApprovalStatusCell({ expense }: { expense: ExpenseResponse }) {
  if (!expense.approvalStatus) {
    return <span className="text-xs text-gray-400">No requerida</span>;
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
        <span className="text-gray-500">
          {expense.reviewedByName}
          {expense.reviewedAt &&
            ` · ${new Date(expense.reviewedAt).toLocaleDateString("es-CO")}`}
        </span>
      )}
      {expense.reviewComment && (
        <span className="text-gray-700 italic">“{expense.reviewComment}”</span>
      )}
    </div>
  );
}
