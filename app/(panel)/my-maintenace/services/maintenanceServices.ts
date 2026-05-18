import { CreateMaintenanceRequest } from "./request/crateMaintenaceRequest";
import { MaintenanceResponse } from "./response/maintenanceResposne";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class DataMaintenanceServices {
  async addMaintenance(
    conjuntoId: string,
    data: CreateMaintenanceRequest,
  ): Promise<MaintenanceResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error("Error creando mantenimiento");
    }

    return response.json();
  }

  async getMaintenances(
    conjuntoId: string,
    status?: string,
  ): Promise<MaintenanceResponse[]> {
    const query = new URLSearchParams({
      conjuntoId,
      ...(status && { status }),
    }).toString();

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances?${query}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error obteniendo mantenimientos");
    }

    return response.json();
  }

  async getUpcomingMaintenances(
    conjuntoId: string,
    days = 7,
  ): Promise<MaintenanceResponse[]> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances/upcoming?conjuntoId=${conjuntoId}&days=${days}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error obteniendo próximos mantenimientos");
    }

    return response.json();
  }

  async updateMaintenance(
    id: string,
    data: Partial<CreateMaintenanceRequest>,
  ): Promise<MaintenanceResponse> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances/${id}`,
      {
        method: "PATCH",
        body: formData,

        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error actualizando mantenimiento");
    }

    return response.json();
  }

  async completeMaintenance(id: string): Promise<MaintenanceResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances/${id}/complete`,
      {
        method: "PATCH",
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error completando mantenimiento");
    }

    return response.json();
  }

  async deleteMaintenance(id: string): Promise<void> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error eliminando mantenimiento");
    }
  }
}
