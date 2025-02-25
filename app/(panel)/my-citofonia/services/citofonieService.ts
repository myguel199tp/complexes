export class CitofonieService {
  async registerVisit(data: FormData): Promise<Response> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/visit/register-visit`,
      {
        method: "POST",
        body: data,
      }
    );

    if (!response.ok) {
      throw new Error("Error al agregar la noticia");
    }

    return response;
  }
}
