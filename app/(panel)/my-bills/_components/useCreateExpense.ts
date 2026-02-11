import { useMutation } from "@tanstack/react-query";
import { DataExpenseServices } from "../services/dataExpenseServices";
import { CreateExpenseRequest } from "../services/request/createExpenseRequest";

const service = new DataExpenseServices();

export const useCreateExpense = () =>
  useMutation({
    mutationFn: (data: CreateExpenseRequest) => service.addExpense(data),
  });
