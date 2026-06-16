"use client";

import React, { useState } from "react";
import { Button, Text } from "complexes-next-components";
import { useTasksQuery } from "./use-tasks-query";
import { useMyTasksQuery } from "./use-my-tasks-query";
import { useUpdateTaskStatusMutation } from "./use-update-task-status-mutation";
import { useDeleteTaskMutation } from "./use-delete-task-mutation";
import { TaskStatus, TasksResponse } from "../services/response/taskResponse";
import ModalCreateTask from "./modal/modalCreateTask";

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: TaskStatus.PENDING, label: "Pendiente", color: "bg-yellow-100 border-yellow-400" },
  { status: TaskStatus.IN_PROGRESS, label: "En progreso", color: "bg-blue-100 border-blue-400" },
  { status: TaskStatus.DONE, label: "Completada", color: "bg-green-100 border-green-400" },
  { status: TaskStatus.CANCELLED, label: "Cancelada", color: "bg-red-100 border-red-400" },
];

const BADGE: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: "bg-yellow-200 text-yellow-800",
  [TaskStatus.IN_PROGRESS]: "bg-blue-200 text-blue-800",
  [TaskStatus.DONE]: "bg-green-200 text-green-800",
  [TaskStatus.CANCELLED]: "bg-red-200 text-red-800",
};

interface Props {
  /** true = employee view (all tasks), false = personal view (my tasks) */
  isEmployee?: boolean;
  date?: string;
}

export default function TasksBoard({ isEmployee = false, date }: Props) {
  const allQuery = useTasksQuery(date);
  const myQuery = useMyTasksQuery(date);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateTaskStatusMutation();
  const { mutate: deleteTask } = useDeleteTaskMutation();
  const [openCreate, setOpenCreate] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const tasks: TasksResponse[] = isEmployee
    ? allQuery.data ?? []
    : myQuery.data ?? [];

  const isLoading = isEmployee ? allQuery.isLoading : myQuery.isLoading;

  function byStatus(status: TaskStatus) {
    return tasks.filter((t) => t.status === status);
  }

  function handleDragStart(e: React.DragEvent, taskId: string) {
    setDraggingId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("taskId", taskId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent, targetStatus: TaskStatus) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;
    updateStatus({ taskId, status: targetStatus });
    setDraggingId(null);
  }

  function handleDragEnd() {
    setDraggingId(null);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Text size="sm" className="text-gray-400">
          Cargando tareas...
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isEmployee && (
        <div className="flex justify-end">
          <Button
            type="button"
            colVariant="primary"
            size="sm"
            onClick={() => setOpenCreate(true)}
          >
            + Nueva tarea
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col.status}
            className={`rounded-lg border-2 ${col.color} p-3 min-h-[200px] transition-colors`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.status)}
          >
            <Text font="bold" size="sm" className="mb-3 block">
              {col.label}
              <span className="ml-2 text-xs font-normal text-gray-500">
                ({byStatus(col.status).length})
              </span>
            </Text>

            <div className="space-y-2">
              {byStatus(col.status).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isDragging={draggingId === task.id}
                  isUpdating={isUpdating}
                  isEmployee={isEmployee}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}

              {byStatus(col.status).length === 0 && (
                <p className="text-center text-xs text-gray-400 py-6">
                  Sin tareas
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <ModalCreateTask isOpen={openCreate} onClose={() => setOpenCreate(false)} />
    </div>
  );
}

interface CardProps {
  task: TasksResponse;
  isDragging: boolean;
  isUpdating: boolean;
  isEmployee: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDelete: () => void;
}

function TaskCard({
  task,
  isDragging,
  isUpdating,
  isEmployee,
  onDragStart,
  onDragEnd,
  onDelete,
}: CardProps) {
  return (
    <div
      draggable={!isUpdating}
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-md shadow-sm border p-3 cursor-grab active:cursor-grabbing select-none transition-opacity ${
        isDragging ? "opacity-40" : "opacity-100"
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <Text font="bold" size="xs" className="leading-tight line-clamp-2">
          {task.title}
        </Text>
        {isEmployee && (
          <button
            type="button"
            onClick={onDelete}
            className="shrink-0 text-gray-300 hover:text-red-500 transition-colors text-xs leading-none"
            title="Eliminar tarea"
          >
            ✕
          </button>
        )}
      </div>

      {task.description && (
        <Text size="xs" className="text-gray-500 mt-1 line-clamp-2">
          {task.description}
        </Text>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">{task.date}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE[task.status]}`}
        >
          {task.status}
        </span>
      </div>
    </div>
  );
}
