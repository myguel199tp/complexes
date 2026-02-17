import { parseCookies } from "nookies";
import { CreateExpenseCategoryRequest } from "./request/createExpenseCategoryRequest";
import { ExpenseCategoryResponse } from "./response/createExpenseCategoryResponse";

export class DataExpenseCategoryServices {
  // ➕ Crear categoría
  async addCategory(
    data: CreateExpenseCategoryRequest,
  ): Promise<ExpenseCategoryResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/expense-categories`,
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
      throw new Error("Error creando categoría");
    }

    return response.json();
  }

  // 📄 Listar categorías
  async getCategories(conjuntoId: string): Promise<ExpenseCategoryResponse[]> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const query = new URLSearchParams({ conjuntoId }).toString();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/expense-categories?${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
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
