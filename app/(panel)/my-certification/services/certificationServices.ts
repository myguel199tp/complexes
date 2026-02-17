export class DataCertificationServices {
  async addCertification(conjuntoId: string, data: FormData) {
    const response = await fetch("/api/documents/create", {
      method: "POST",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      body: data,
    });

    const result = await response;

    if (!response.ok) {
      throw result;
    }

    return result;
  }

  async updateCertification(conjuntoId: string, id: string, data: FormData) {
    return fetch(`/api/documents/update-documents/${id}`, {
      method: "PATCH",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      body: data,
    });
  }

  async deleteCertification(conjuntoId: string, id: string) {
    return fetch(`/api/documents/delete-documents/${id}`, {
      method: "DELETE",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
    });
  }
}
