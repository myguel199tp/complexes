import { parseCookies } from "nookies";
import { CreateExpenseRequest } from "./request/createExpenseRequest";
import { ExpenseResponse } from "./response/expenseResponse";

export class DataExpenseServices {
  async addExpense(conjuntoId: string, data: FormData): Promise<Response> {
    const response = await fetch(`/api/gast/create`, {
      method: "POST",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      body: data,
    });

    if (!response.ok) {
      throw new Error("Error creando gasto");
    }

    return response;
  }

  async getExpenses(conjuntoId: string): Promise<ExpenseResponse[]> {
    const response = await fetch(`/api/gast`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error obteniendo gastos");
    }

    return response.json();
  }

  // ✏ Editar gasto
  async updateExpense(
    id: string,
    data: Partial<CreateExpenseRequest>,
  ): Promise<ExpenseResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
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

  // ❌ Eliminar gasto
  async deleteExpense(id: string): Promise<void> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error eliminando gasto");
    }
  }
}
