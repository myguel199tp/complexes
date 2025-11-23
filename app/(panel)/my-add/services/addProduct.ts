import { parseCookies } from "nookies";

export class DataProductService {
  async products(data: FormData): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;
    console.log("URL:", process.env.NEXT_PUBLIC_API_URL);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/product`,
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
      throw new Error("Error al agregar el negocio");
    }

    return response;
  }
}
