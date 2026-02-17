export class DataNewsServices {
  async addNews(conjuntoId: string, data: FormData) {
    const response = await fetch("/api/news/create", {
      method: "POST",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      body: data,
    });

    const result = await response.json();

    if (!response.ok) {
      throw result;
    }

    return result;
  }
}
