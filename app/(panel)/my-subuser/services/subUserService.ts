import { parseCookies } from "nookies";

export class AddSubUsser {
  async createSubuser(formData: FormData): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register-subuser`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Error al crear subusuario");
    }

    return response.json();
  }
}
