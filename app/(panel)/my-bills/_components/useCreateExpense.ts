import { useMutation } from "@tanstack/react-query";
import { DataExpenseServices } from "../services/dataExpenseServices";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const service = new DataExpenseServices();

export const useCreateExpense = () => {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: (data: FormData) => service.addExpense(conjuntoId, data),
  });
};
