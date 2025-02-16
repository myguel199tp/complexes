export class DataNewsServices {
  async addNews(data: FormData): Promise<Response> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/new-admin/register-admin`,
      {
        method: "POST",
        body: data, // Directamente pasar FormData como cuerpo
      }
    );

    if (!response.ok) {
      throw new Error("Error al agregar la noticia");
    }

    return response;
  }
}
