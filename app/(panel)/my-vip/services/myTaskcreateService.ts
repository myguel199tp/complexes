import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { TasksRequest, UpdateTaskStatusRequest } from "./request/taskRequest";
import { StaffResponse, TasksResponse } from "./response/taskResponse";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/create-task`;

function headers(conjuntoId: string) {
  return {
    "Content-Type": "application/json",
    "x-conjunto-id": conjuntoId,
  };
}

export class DataTaskCreateServices {
  async createTask(conjuntoId: string, data: TasksRequest): Promise<TasksResponse> {
    const response = await fetchWithAuth(BASE, {
      method: "POST",
      headers: headers(conjuntoId),
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message ?? "Error al crear la tarea");
    return json;
  }

  async listAllTasks(conjuntoId: string, date?: string): Promise<TasksResponse[]> {
    const url = date ? `${BASE}?date=${date}` : BASE;
    const response = await fetchWithAuth(url, {
      method: "GET",
      headers: headers(conjuntoId),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message ?? "Error al obtener tareas");
    return json;
  }

  async listMyTasks(conjuntoId: string, date?: string): Promise<TasksResponse[]> {
    const url = date ? `${BASE}/my-tasks?date=${date}` : `${BASE}/my-tasks`;
    const response = await fetchWithAuth(url, {
      method: "GET",
      headers: headers(conjuntoId),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message ?? "Error al obtener mis tareas");
    return json;
  }

  async getStaff(conjuntoId: string): Promise<StaffResponse[]> {
    const response = await fetchWithAuth(`${BASE}/staff`, {
      method: "GET",
      headers: headers(conjuntoId),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message ?? "Error al obtener personal");
    return json;
  }

  async updateStatus(
    conjuntoId: string,
    taskId: string,
    data: UpdateTaskStatusRequest,
  ): Promise<TasksResponse> {
    const response = await fetchWithAuth(`${BASE}/${taskId}/status`, {
      method: "PATCH",
      headers: headers(conjuntoId),
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message ?? "Error al actualizar estado");
    return json;
  }

  async deleteTask(conjuntoId: string, taskId: string): Promise<void> {
    const response = await fetchWithAuth(`${BASE}/${taskId}`, {
      method: "DELETE",
      headers: headers(conjuntoId),
    });
    if (!response.ok) {
      const json = await response.json();
      throw new Error(json?.message ?? "Error al eliminar la tarea");
    }
  }
}

export const taskService = new DataTaskCreateServices();
