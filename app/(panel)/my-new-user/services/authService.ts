import { UsersResponse } from "./response/usersResponse";

export class DataRegisterIdentification {
  async searchByIdentification(numberid: string): Promise<UsersResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/conjunto-by-identification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ numberid }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Error al buscar conjunto por NIT");
    }

    return data;
  }
}
