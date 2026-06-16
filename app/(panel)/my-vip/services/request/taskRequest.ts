import { TaskStatus } from "../response/taskResponse";

export interface TasksRequest {
  title: string;
  description: string;
  assignedToId: string;
  date: string;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}
