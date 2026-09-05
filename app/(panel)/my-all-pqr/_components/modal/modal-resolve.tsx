"use client";

import React from "react";
import {
  Modal,
  SelectField,
  TextAreaField,
  Button,
  Text,
} from "complexes-next-components";
import { useResolveAllForm } from "../use-resolve-all-form";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  radicado: string;
}

export default function ModalResolveAll({
  isOpen,
  onClose,
  id,
  radicado,
}: Props) {
  const {
    register,
    setValue,
    watch,
    handleSubmit,
    errors,
    isPending,
    staffOptions,
    isLoadingStaff,
  } = useResolveAllForm(id, onClose);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Dar respuesta - ${radicado}`}
      className="max-w-lg w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          {/* SelectField no es un <select> nativo: emite
              onChange({ target: { value } }) sin `name`, así que el valor se
              fija a mano con setValue en lugar de confiar en register. */}
          <SelectField
            {...register("status")}
            value={watch("status") ?? ""}
            onChange={(e) =>
              setValue("status", e.target.value, { shouldValidate: true })
            }
            helpText="Estado de la petición"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
            defaultOption="Estado de la petición"
            options={[
              { value: "pendiente", label: "Pendiente" },
              { value: "en_proceso", label: "En proceso" },
              { value: "aceptada", label: "Aceptada" },
              { value: "rechazada", label: "Rechazada" },
            ]}
            hasError={!!errors.status}
            errorMessage={errors.status?.message}
          />
        </div>

        <div>
          <SelectField
            {...register("assignedToId")}
            value={watch("assignedToId") ?? ""}
            onChange={(e) =>
              setValue("assignedToId", e.target.value, {
                shouldValidate: true,
              })
            }
            disabled={isLoadingStaff}
            helpText="Encargado (opcional)"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
            defaultOption={
              isLoadingStaff
                ? "Cargando colaboradores..."
                : "Sin encargado asignado"
            }
            options={staffOptions}
            hasError={!!errors.assignedToId}
            errorMessage={errors.assignedToId?.message}
          />
          <Text size="xs" className="text-gray-500 mt-1">
            Si asignas un encargado, la petición y tu respuesta le aparecen en
            su perfil.
          </Text>
        </div>

        <div>
          <TextAreaField
            placeholder="Escribe la resolución o respuesta para el propietario..."
            className="mt-2 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            maxLength={500}
            {...register("resolution")}
            errorMessage={errors.resolution?.message}
          />
          <Text size="xs" className="text-right text-gray-500 mt-1">
            Mínimo 10 - Máximo 500 caracteres
          </Text>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" colVariant="default" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" colVariant="success" size="sm" disabled={isPending}>
            {isPending ? "Guardando..." : "Enviar respuesta"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
