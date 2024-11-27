import { LoginRequest } from "./request/login";

export async function loginUser(data: LoginRequest): Promise<Response> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  return response;
}
