import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { UsersListResponse } from "./response/usersResponse";

export async function allUserListService(): Promise<UsersListResponse[]> {
  const payload = getTokenPayload();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/allUser/${payload?.nameUnit}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: UsersListResponse[] = await response.json();
  return data;
}
