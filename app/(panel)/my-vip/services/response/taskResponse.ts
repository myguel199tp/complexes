export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  DONE = "done",
  CANCELLED = "cancelled",
}

export interface TasksResponse {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedById: string;
  conjuntoId: string;
  date: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StaffResponse {
  id: string;
  name: string;
  lastName: string;
  roles: string[];
  file?: string;
}
