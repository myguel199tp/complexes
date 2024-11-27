import { RegisterRequest } from "./request/register";

export async function registerUser(data: RegisterRequest): Promise<Response> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  return response;
}
