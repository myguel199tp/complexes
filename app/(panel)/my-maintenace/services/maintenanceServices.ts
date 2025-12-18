import { CreateMaintenanceDto } from "../types/maintenance.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const maintenanceService = {
  create: async (data: CreateMaintenanceDto) => {
    const res = await fetch(`${API_URL}/api/maintenances`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Error creando mantenimiento");
    }

    return res.json();
  },

  getAll: async (conjuntoId: string) => {
    const res = await fetch(
      `${API_URL}/maintenances?conjuntoId=${conjuntoId}`,
      { credentials: "include" }
    );

    if (!res.ok) {
      throw new Error("Error cargando mantenimientos");
    }

    return res.json();
  },
};
