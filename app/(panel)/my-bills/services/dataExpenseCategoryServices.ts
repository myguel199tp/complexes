import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { CreateExpenseCategoryRequest } from "./request/createExpenseCategoryRequest";
import { ExpenseCategoryResponse } from "./response/createExpenseCategoryResponse";

export class DataExpenseCategoryServices {
  async addCategory(
    conjuntoId: string,
    data: CreateExpenseCategoryRequest,
  ): Promise<ExpenseCategoryResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/expense-categories`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error("Error creando categoría");
    }

    return response.json();
  }

  async getCategories(conjuntoId: string): Promise<ExpenseCategoryResponse[]> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/expense-categories`,
      {
        method: "GET",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error obteniendo categorías");
    }

    return response.json();
  }
}
