import { parseCookies } from "nookies";

export interface CreateExpenseCategoryRequest {
  name: string;
}

export interface ExpenseCategoryResponse {
  id: string;
  name: string;
}

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
  async getCategories(): Promise<ExpenseCategoryResponse[]> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/expense-categories`,
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
