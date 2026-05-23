import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { CreateMaintenanceRequest } from "./request/crateMaintenaceRequest";
import { MaintenanceResponse } from "./response/maintenanceResposne";
import { CompleteMaintenanceRequest } from "./request/completeMaintenanceRequest";

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

  async getMaintenances(conjuntoId: string): Promise<MaintenanceResponse[]> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances`,
      {
        method: "GET",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error obteniendo mantenimientos");
    }

    return response.json();
  }

  async getMaintenanceById(
    id: string,
    conjuntoId: string,
  ): Promise<MaintenanceResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances/${id}`,
      {
        method: "GET",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error obteniendo mantenimiento");
    }

    return response.json();
  }

  async completeMaintenance(
    id: string,
    conjuntoId: string,
    data: CompleteMaintenanceRequest,
  ): Promise<MaintenanceResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances/${id}/complete`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error("Error completando mantenimiento");
    }

    return response.json();
  }

  async updateMaintenance(
    id: string,
    conjuntoId: string,
    data: Partial<CreateMaintenanceRequest>,
  ): Promise<MaintenanceResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error("Error actualizando mantenimiento");
    }

    return response.json();
  }

  async deleteMaintenance(id: string, conjuntoId: string): Promise<void> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances/${id}`,
      {
        method: "DELETE",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error eliminando mantenimiento");
    }
  }
}

export const maintenanceService = new DataMaintenanceServices();
