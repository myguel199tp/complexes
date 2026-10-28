import { CreateExpenseRequest } from "./request/createExpenseRequest";
import { ExpenseResponse } from "./response/expenseResponse";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

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
      throw await backendError(response, "Error creando gasto");
    }

    return response;
  }

  /**
   * Marca como pagado un gasto aprobado. `data` lleva `paymentDate` y, si
   * hay, el comprobante en `file`.
   */
  async payExpense(
    conjuntoId: string,
    id: string,
    data: FormData,
  ): Promise<ExpenseResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${id}/pay`,
      {
        method: "POST",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const message = Array.isArray(body?.message)
        ? body.message[0]
        : body?.message;
      throw new Error(message || "No se pudo marcar el gasto como pagado");
    }

    return response.json();
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
      throw await backendError(response, "Error obteniendo gastos");
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
      throw await backendError(response, "Error actualizando gasto");
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
      throw await backendError(response, "Error eliminando gasto");
    }
  }
}
