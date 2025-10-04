"use client";

import React from "react";
import {
  Modal,
  Text,
  InputField,
  Button,
  SelectField,
} from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useFormPayUser } from "./use-form";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: EnsembleResponse | null;
  title?: string;
}

export default function ModalPay({
  isOpen,
  onClose,
  selectedUser,
  title = "Adicionar pago",
}: Props) {
  const { t } = useTranslation();
  const { register, onSubmit, formState } = useFormPayUser(
    String(selectedUser?.id)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="w-[900px] h-auto"
    >
      {selectedUser ? (
        <div className="space-y-4">
          {/* Datos del propietario */}
          <div className="space-y-2 border-b pb-3">
            <Text size="md">
              <Text as="span" font="semi">
                {t("nombre")}:
              </Text>{" "}
              {selectedUser.user.name}
            </Text>
            <Text size="md">
              <Text as="span" font="semi">
                {t("apellido")}:
              </Text>{" "}
              {selectedUser.user.lastName}
            </Text>
            <Text size="md">
              <Text as="span" font="semi">
                {t("torre")}:
              </Text>{" "}
              {selectedUser.tower}
            </Text>
            <Text size="md">
              <Text as="span" font="semi">
                {t("numeroInmuebleResidencial")}:
              </Text>{" "}
              {selectedUser.apartment}
            </Text>
            <Text size="md">
              <Text as="span" font="semi">
                {t("numeroPlaca")}:
              </Text>{" "}
              {selectedUser.plaque}
            </Text>
          </div>

          {/* Formulario */}
          <form onSubmit={onSubmit}>
            <div className="space-y-3">
              <InputField
                label={t("valorCuota") || "Valor de la cuota"}
                type="number"
                {...register("amount")}
              />

              <InputField
                label={t("fechaVencimiento") || "Fecha de vencimiento"}
                type="date"
                {...register("dueDate")}
              />

              <InputField
                label={t("fechaPago") || "Fecha de pago"}
                type="date"
                {...register("paidAt")}
              />

              <SelectField
                label={t("estado") || "Estado"}
                {...register("status")}
                options={[
                  { label: t("pendiente") || "Pendiente", value: "pending" },
                  { label: t("pagado") || "Pagado", value: "paid" },
                  { label: t("atrasado") || "Atrasado", value: "late" },
                ]}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" onClick={onClose}>
                {t("cancelar") || "Cancelar"}
              </Button>
              <Button type="submit" disabled={formState.isSubmitting}>
                {formState.isSubmitting
                  ? t("guardando") || "Guardando..."
                  : t("guardar") || "Guardar"}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="py-4">
          {t("noSeleccionado") || "No hay propietario seleccionado"}
        </div>
      )}
    </Modal>
  );
}
