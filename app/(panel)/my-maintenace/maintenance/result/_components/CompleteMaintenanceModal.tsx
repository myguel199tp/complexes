"use client";

import {
  Button,
  InputField,
  Modal,
  TextAreaField,
} from "complexes-next-components";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { number, object, string } from "yup";
import { CompleteMaintenanceRequest } from "../../../services/request/completeMaintenanceRequest";
import { useCompleteMaintenance } from "../../_components/useMaintenance";

const schema = object({
  cost: number()
    .transform((val, orig) => (orig === "" ? undefined : val))
    .min(0, "El costo debe ser mayor a 0")
    .optional()
    .nullable(),
  invoiceNumber: string().optional(),
  evidenceUrl: string().url("Ingresa una URL válida").optional(),
  notes: string().optional(),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  maintenanceId: string;
  conjuntoId: string;
}

export default function CompleteMaintenanceModal({
  isOpen,
  onClose,
  maintenanceId,
  conjuntoId,
}: Props) {
  const completeMutation = useCompleteMaintenance(conjuntoId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompleteMaintenanceRequest>({
    resolver: yupResolver(schema),
    defaultValues: {
      invoiceNumber: "",
      evidenceUrl: "",
      notes: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const payload: CompleteMaintenanceRequest = {
      ...(data.cost != null ? { cost: data.cost } : {}),
      ...(data.invoiceNumber ? { invoiceNumber: data.invoiceNumber } : {}),
      ...(data.evidenceUrl ? { evidenceUrl: data.evidenceUrl } : {}),
      ...(data.notes ? { notes: data.notes } : {}),
    };

    await completeMutation.mutateAsync({ id: maintenanceId, data: payload });
    reset();
    onClose();
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registrar ejecución">
      <form onSubmit={onSubmit} className="space-y-4 pt-2">
        <Controller
          name="cost"
          control={control}
          render={({ field }) => (
            <InputField
              type="number"
              label="Costo"
              placeholder="Ej: 150000"
              value={field.value ?? ""}
              onChange={field.onChange}
              errorMessage={errors.cost?.message}
            />
          )}
        />

        <Controller
          name="invoiceNumber"
          control={control}
          render={({ field }) => (
            <InputField
              label="Número de factura"
              placeholder="Ej: FAC-001"
              value={field.value ?? ""}
              onChange={field.onChange}
              errorMessage={errors.invoiceNumber?.message}
            />
          )}
        />

        <Controller
          name="evidenceUrl"
          control={control}
          render={({ field }) => (
            <InputField
              type="url"
              label="URL de evidencia"
              placeholder="https://..."
              value={field.value ?? ""}
              onChange={field.onChange}
              errorMessage={errors.evidenceUrl?.message}
            />
          )}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <TextAreaField
              label="Notas"
              placeholder="Observaciones del mantenimiento realizado..."
              value={field.value ?? ""}
              onChange={field.onChange}
              errorMessage={errors.notes?.message}
            />
          )}
        />

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
            colVariant="success"
            size="sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registrando..." : "Confirmar ejecución"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
