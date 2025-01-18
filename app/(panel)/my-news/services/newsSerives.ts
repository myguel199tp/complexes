export class DataNewsServices {
  async addNews(request: FormData): Promise<Response> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/new-admin/register-admin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: request,
      }
    );

    return response;
  }
}
