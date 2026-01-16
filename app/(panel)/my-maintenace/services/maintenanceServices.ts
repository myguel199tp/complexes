import { parseCookies } from "nookies";
import { CreateMaintenanceRequest } from "./request/crateMaintenaceRequest";
import { MaintenanceResponse } from "./response/maintenanceResposne";

export class DataMaintenanceServices {
  // ➕ Crear mantenimiento
  async addMaintenance(
    data: CreateMaintenanceRequest
  ): Promise<MaintenanceResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Error creando mantenimiento");
    }

    return response.json();
  }

  // 📄 Listar mantenimientos
  async getMaintenances(
    conjuntoId: string,
    status?: string
  ): Promise<MaintenanceResponse[]> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const query = new URLSearchParams({
      conjuntoId,
      ...(status && { status }),
    }).toString();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances?${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Error obteniendo mantenimientos");
    }

    return response.json();
  }

  // 🟡 Próximos N días
  async getUpcomingMaintenances(
    conjuntoId: string,
    days = 7
  ): Promise<MaintenanceResponse[]> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances/upcoming?conjuntoId=${conjuntoId}&days=${days}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Error obteniendo próximos mantenimientos");
    }

    return response.json();
  }

  // ✏️ Editar mantenimiento
  async updateMaintenance(
    id: string,
    data: Partial<CreateMaintenanceRequest>
  ): Promise<MaintenanceResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances/${id}`,
      {
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Error actualizando mantenimiento");
    }

    return response.json();
  }

  // ✅ Completar mantenimiento
  async completeMaintenance(id: string): Promise<MaintenanceResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances/${id}/complete`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Error completando mantenimiento");
    }

    return response.json();
  }

  // 🗑️ Eliminado lógico
  async deleteMaintenance(id: string): Promise<void> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/maintenances/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Error eliminando mantenimiento");
    }
  }
}
