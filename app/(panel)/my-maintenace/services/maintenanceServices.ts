import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { CreateMaintenanceRequest } from "./request/crateMaintenaceRequest";
import { MaintenanceResponse } from "./response/maintenanceResposne";
import { CompleteMaintenanceRequest } from "./request/completeMaintenanceRequest";
import { MaintenanceHistoryResponse } from "./response/maintenanceHistoryResponse";

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

  async getMaintenanceHistory(
    id: string,
    conjuntoId: string,
  ): Promise<MaintenanceHistoryResponse[]> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances/${id}/history`,
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

  /**
   * Con evidencia capturada (foto o video) la petición viaja como multipart;
   * sin archivo se mantiene el JSON de siempre. El Content-Type del multipart
   * lo pone el navegador junto con su boundary, por eso no se fija a mano.
   */
  async completeMaintenance(
    id: string,
    conjuntoId: string,
    data: CompleteMaintenanceRequest,
    evidence?: File | null,
  ): Promise<MaintenanceResponse> {
    let body: BodyInit;
    const headers: Record<string, string> = { "x-conjunto-id": conjuntoId };

    if (evidence) {
      const formData = new FormData();
      formData.append("evidence", evidence);

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });

      body = formData;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances/${id}/complete`,
      {
        method: "PATCH",
        headers,
        body,
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
