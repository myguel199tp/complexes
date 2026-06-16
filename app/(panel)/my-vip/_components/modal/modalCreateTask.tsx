"use client";

import React, { useState } from "react";
import {
  Button,
  InputField,
  Modal,
  SelectField,
  Text,
} from "complexes-next-components";
import { useCreateTaskMutation } from "../use-create-task-mutation";
import { useStaffQuery } from "../use-staff-query";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY = { title: "", description: "", assignedToId: "", date: "" };

export default function ModalCreateTask({ isOpen, onClose }: Props) {
  const { mutate, isPending } = useCreateTaskMutation();
  const { data: staff = [] } = useStaffQuery();
  const [form, setForm] = useState(EMPTY);

  const staffOptions = staff.map((s) => ({
    value: s.id,
    label: `${s.name} ${s.lastName}`,
  }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate(form, {
      onSuccess: () => {
        setForm(EMPTY);
        onClose();
      },
    });
  }

  function handleClose() {
    setForm(EMPTY);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4 p-2">
        <Text font="bold" size="lg">
          Nueva tarea
        </Text>

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

          <SelectField
            label="Asignar a"
            value={form.assignedToId}
            onChange={(e) =>
              setForm((f) => ({ ...f, assignedToId: e.target.value }))
            }
            options={staffOptions}
            required
          />

          <InputField
            label="Fecha"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
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
            disabled={isPending}
          >
            {isPending ? "Creando..." : "Crear tarea"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
