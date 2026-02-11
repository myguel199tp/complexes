import { parseCookies } from "nookies";
import { CreateExpenseRequest } from "./request/createExpenseRequest";
import { ExpenseResponse } from "./response/expenseResponse";

export class DataExpenseServices {
  // ➕ Crear gasto
  async addExpense(data: CreateExpenseRequest): Promise<ExpenseResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/expenses`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error creando gasto");
    }

    return response.json();
  }

  // 📄 Listar gastos por periodo
  async getExpenses(period: string): Promise<ExpenseResponse[]> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const query = new URLSearchParams({ period }).toString();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/expenses?${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      },
    );

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
