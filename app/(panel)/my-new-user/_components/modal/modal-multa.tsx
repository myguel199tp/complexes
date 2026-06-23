"use client";

import React, { useEffect } from "react";

import {
  Button,
  InputField,
  Modal,
  TextAreaField,
} from "complexes-next-components";

import { useFormResidentFine } from "./use-multa-form";

import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";

interface Props {
  isOpen: boolean;

  onClose: () => void;

  selectedUser?: EnsembleResponse | null;

  title?: string;
}

export default function ModalMulta({
  isOpen,
  onClose,
  selectedUser,
  title = "Adicionar multa",
}: Props) {
  const {
    register,
    formState: { errors },
    isSubmitting,
    handleSubmit,
    setValue,
  } = useFormResidentFine();

  useEffect(() => {
    if (selectedUser?.id) {
      setValue("relationId", selectedUser.id);
    }
  }, [selectedUser, setValue]);

  return (
    <Modal
      isOpen={isOpen}
      closeOnOverlayClick={false}
      onClose={onClose}
      title={title}
      className="w-[1200px]"
    >
      <div className="mt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="text"
            placeholder="Título de la multa"
            helpText="Título"
            {...register("title")}
            inputSize="md"
            rounded="md"
            hasError={!!errors.title}
            errorMessage={errors.title?.message}
          />

          <TextAreaField
            placeholder="Razón de la multa"
            helpText="Razón"
            {...register("reason")}
            hasError={!!errors.reason}
            errorMessage={errors.reason?.message}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              type="number"
              placeholder="Monto"
              helpText="Monto"
              {...register("amount")}
              inputSize="md"
              rounded="md"
              hasError={!!errors.amount}
              errorMessage={errors.amount?.message}
            />

            <InputField
              type="date"
              helpText="Fecha límite de pago"
              {...register("dueDate")}
              inputSize="md"
              rounded="md"
              hasError={!!errors.dueDate}
              errorMessage={errors.dueDate?.message}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              type="date"
              helpText="Fecha del incidente"
              {...register("incidentDate")}
              inputSize="md"
              rounded="md"
              hasError={!!errors.incidentDate}
              errorMessage={errors.incidentDate?.message}
            />

            <InputField
              type="text"
              placeholder="URL evidencia"
              helpText="Evidencia"
              {...register("evidenceUrl")}
              inputSize="md"
              rounded="md"
              hasError={!!errors.evidenceUrl}
              errorMessage={errors.evidenceUrl?.message}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" colVariant="default" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              colVariant="success"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando multa..." : "Crear multa"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
