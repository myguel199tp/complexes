import { CreateExpenseCategoryRequest } from "./request/createExpenseCategoryRequest";
import { ExpenseCategoryResponse } from "./response/createExpenseCategoryResponse";

export class DataExpenseCategoryServices {
  async addCategory(
    conjuntoId: string,
    data: CreateExpenseCategoryRequest,
  ): Promise<ExpenseCategoryResponse> {
    const response = await fetch(`/api/category/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error creando categoría");
    }

    return response.json();
  }

  // 📄 Listar categorías
  async getCategories(conjuntoId: string): Promise<ExpenseCategoryResponse[]> {
    const response = await fetch(`/api/category`, {
      method: "GET",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error obteniendo categorías");
    }

    return response.json();
  }
}
