import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import {
  ActivateEmergencyRequest,
  ResolveEmergencyRequest,
} from "./request/activateEmergencyRequest";
import {
  EmergencyDashboardResponse,
  EmergencyEventResponse,
  EmergencyPriority,
  EmergencyReportResponse,
  EmergencyResponse,
} from "./response/emergencyResponse";

export class DataEmergencyServices {
  async getActive(conjuntoId: string): Promise<EmergencyResponse | null> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/emergency/active?conjuntoId=${conjuntoId}`,
      {
        method: "GET",
        headers: { "x-conjunto-id": conjuntoId },
      },
    );

    if (!response.ok) {
      throw new Error("Error obteniendo la emergencia activa");
    }

    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  }

  async activate(
    conjuntoId: string,
    data: ActivateEmergencyRequest,
  ): Promise<EmergencyResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/emergency/activate`,
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
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Error activando la emergencia");
    }

    return response.json();
  }

  async resolve(
    id: string,
    conjuntoId: string,
    data: ResolveEmergencyRequest,
  ): Promise<EmergencyResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/emergency/${id}/resolve`,
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
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Error resolviendo la emergencia");
    }

    return response.json();
  }

  async getDashboard(
    id: string,
    conjuntoId: string,
  ): Promise<EmergencyDashboardResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/emergency/${id}/dashboard`,
      {
        method: "GET",
        headers: { "x-conjunto-id": conjuntoId },
      },
    );

    if (!response.ok) {
      throw new Error("Error obteniendo el tablero de la emergencia");
    }

    return response.json();
  }

  async getReports(
    id: string,
    conjuntoId: string,
    filters: { priority?: EmergencyPriority; tower?: string } = {},
  ): Promise<EmergencyReportResponse[]> {
    const params = new URLSearchParams();
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.tower) params.set("tower", filters.tower);

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/emergency/${id}/reports?${params.toString()}`,
      {
        method: "GET",
        headers: { "x-conjunto-id": conjuntoId },
      },
    );

    if (!response.ok) {
      throw new Error("Error obteniendo los reportes de la emergencia");
    }

    return response.json();
  }

  async getTimeline(
    id: string,
    conjuntoId: string,
  ): Promise<EmergencyEventResponse[]> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/emergency/${id}/timeline`,
      {
        method: "GET",
        headers: { "x-conjunto-id": conjuntoId },
      },
    );

    if (!response.ok) {
      throw new Error("Error obteniendo la línea de tiempo de la emergencia");
    }

    return response.json();
  }

  async setBrigadeMember(
    relationId: string,
    conjuntoId: string,
    isBrigadeMember: boolean,
  ): Promise<void> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/${relationId}/brigade`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
        body: JSON.stringify({ isBrigadeMember }),
      },
    );

    if (!response.ok) {
      throw new Error("Error actualizando brigadista");
    }
  }
}

export const emergencyService = new DataEmergencyServices();
