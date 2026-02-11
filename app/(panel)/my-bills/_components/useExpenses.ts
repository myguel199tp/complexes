import { useQuery } from "@tanstack/react-query";
import { DataExpenseServices } from "../services/dataExpenseServices";

const service = new DataExpenseServices();

export const useExpenses = (period: string) =>
  useQuery({
    queryKey: ["expenses", period],
    queryFn: () => service.getExpenses(period),
  });
