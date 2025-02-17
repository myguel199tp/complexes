import { UsersResponse } from "./response/usersResponse";

export async function allUserService(): Promise<UsersResponse[]> {
  const nameUnit = localStorage.getItem("unit");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/allUser/${nameUnit}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: UsersResponse[] = await response.json();
  return data;
}
