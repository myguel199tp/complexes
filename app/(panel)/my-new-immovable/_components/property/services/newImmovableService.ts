import { parseCookies } from "nookies";

export class NewImmovableServices {
  async immovableServices(data: FormData): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sales/register-immueble`,
      {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Error al agregar el inmueble");
    }

    return response;
  }
}
