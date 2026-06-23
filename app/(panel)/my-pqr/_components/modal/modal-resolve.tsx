"use client";

import React from "react";
import {
  Modal,
  TextAreaField,
  Button,
  Text,
} from "complexes-next-components";
import { useResolveForm } from "../use-resolve-form";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  radicado: string;
}

export default function ModalResolve({ isOpen, onClose, id, radicado }: Props) {
  const { register, handleSubmit, errors, isPending } = useResolveForm(
    id,
    onClose,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Dar respuesta - ${radicado}`}
      className="max-w-lg w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado de la petición
          </label>
          <select
            {...register("status")}
            className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En proceso</option>
            <option value="aceptada">Aceptada</option>
            <option value="rechazada">Rechazada</option>
          </select>
          {errors.status && (
            <Text size="xs" colVariant="danger" className="mt-1">
              {errors.status.message}
            </Text>
          )}
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
