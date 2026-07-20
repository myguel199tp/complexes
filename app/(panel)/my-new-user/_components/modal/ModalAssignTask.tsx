"use client";

import React, { useState } from "react";
import { Button, InputField, Modal, Text } from "complexes-next-components";
import { useCreateTaskMutation } from "@/app/(panel)/my-vip/_components/use-create-task-mutation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Id de usuario del colaborador al que se asigna la tarea. */
  assignedToId?: string;
  /** Nombre del colaborador, solo para mostrar. */
  assignedToName?: string;
}

const EMPTY = { title: "", description: "", date: "" };

export default function ModalAssignTask({
  isOpen,
  onClose,
  assignedToId,
  assignedToName,
}: Props) {
  const { mutate, isPending } = useCreateTaskMutation();
  const [form, setForm] = useState(EMPTY);

  function handleClose() {
    setForm(EMPTY);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assignedToId) return;

    mutate(
      { ...form, assignedToId },
      {
        onSuccess: () => {
          setForm(EMPTY);
          onClose();
        },
      },
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4 p-2">
        <Text font="bold" size="lg">
          Nueva tarea
        </Text>

        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
          <Text size="xs" className="text-gray-500">
            Asignada a
          </Text>
          <Text size="sm" font="bold">
            {assignedToName || "Colaborador seleccionado"}
          </Text>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <InputField
              label="Título"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <InputField
              label="Descripción"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              required
            />
          </div>

          <div className="sm:col-span-2">
            <InputField
              label="Fecha"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            colVariant="default"
            size="sm"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            colVariant="primary"
            size="sm"
            disabled={isPending || !assignedToId}
          >
            {isPending ? "Creando..." : "Crear tarea"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
