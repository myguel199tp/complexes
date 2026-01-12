import { parseCookies } from "nookies";

export class DataNewsServices {
  async addNews(data: FormData): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/new-admin/register-admin`,
      {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    return response;
  }
}
