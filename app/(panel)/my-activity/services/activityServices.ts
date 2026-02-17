export class DataActivityServices {
  async addActivity(conjuntoId: string, data: FormData) {
    return fetch("/api/activity/create", {
      method: "POST",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      body: data,
    });
  }

  async updateActivity(conjuntoId: string, id: string, data: FormData) {
    return fetch(`/api/activity/update-activity/${id}`, {
      method: "PATCH",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      body: data,
    });
  }

  async deleteActivity(conjuntoId: string, id: string) {
    return fetch(`/api/activity/delete-activity/${id}`, {
      method: "DELETE",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
    });
  }
}
