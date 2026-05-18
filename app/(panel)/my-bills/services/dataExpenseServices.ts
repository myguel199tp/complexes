import { CreateExpenseRequest } from "./request/createExpenseRequest";
import { ExpenseResponse } from "./response/expenseResponse";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class DataExpenseServices {
  async addExpense(conjuntoId: string, data: FormData): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/expenses/register`,
      {
        method: "POST",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );

    if (!response.ok) {
      throw new Error("Error creando gasto");
    }

    return response;
  }

  async getExpenses(conjuntoId: string): Promise<ExpenseResponse[]> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/expenses/all-expense`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error obteniendo gastos");
    }

    return response.json();
  }

  async updateExpense(
    id: string,
    data: Partial<CreateExpenseRequest>,
  ): Promise<ExpenseResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error actualizando gasto");
    }

    return response.json();
  }

  async deleteExpense(id: string): Promise<void> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error eliminando gasto");
    }
  }
}
