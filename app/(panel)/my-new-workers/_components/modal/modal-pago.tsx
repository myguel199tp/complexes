"use client";

import React, { useState } from "react";
import {
  Modal,
  Text,
  InputField,
  Button,
  SelectField,
  TextAreaField,
} from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useFormPayUser } from "./use-form";
import { PayUserForm } from "./adminfeePay";
import { useUiStore } from "./store/new-store";
import { FeeType } from "../../services/request/adminFee";
import { useLanguage } from "@/app/hooks/useLanguage";

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
  const { language } = useLanguage();

  const { register, onSubmit, formState, setValue } = useFormPayUser(
    String(selectedUser?.id)
  );
  const { isSideNewOpen } = useUiStore();

  const [selectedType, setSelectedType] = useState<FeeType | null>(null);
  const [customType, setCustomType] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const defaultDescriptions: Record<FeeType, string> = {
    [FeeType.CUOTA_DE_ADMINISTRACION]:
      "Pago correspondiente a la cuota mensual de administración del conjunto residencial.",
    [FeeType.APORTE_FONDO]:
      "Aporte destinado al fondo de imprevistos o de reserva de la copropiedad.",
    [FeeType.CUOTA_EXTRAORDINARIAS]:
      "Pago por cuotas extraordinarias aprobadas por la asamblea para cubrir gastos no ordinarios.",
    [FeeType.MORA]:
      "Interés generado por el retraso en el pago de cuotas de administración o extraordinarias.",
    [FeeType.MULTAS_Y_SANCIONES]:
      "Pago de multas o sanciones impuestas por incumplimiento del reglamento de propiedad horizontal.",
    [FeeType.PAGO_DE_PARQUEADERO]:
      "Pago correspondiente al uso o arriendo de parqueadero asignado o adicional.",
    [FeeType.ZONAS_COMUNES]:
      "Pago por reserva o uso exclusivo de zonas comunes, como el salón social o zonas recreativas.",
    [FeeType.OTRO]:
      "Pago correspondiente a un concepto diferente a los anteriormente mencionados.",
  };

  const options = Object.values(FeeType).map((value) => ({
    value,
    label:
      value === "otro"
        ? "Otro (especificar)"
        : value.charAt(0).toUpperCase() + value.slice(1),
  }));

  const handleSelectChange = (value: FeeType) => {
    setSelectedType(value);
    setValue("type", value);
    if (value === FeeType.OTRO) {
      setDescription("");
      setCustomType("");
    } else {
      setDescription(defaultDescriptions[value]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      closeOnOverlayClick={false}
      onClose={onClose}
      title={title}
      className="w-[900px] h-auto"
    >
      {selectedUser ? (
        <div key={language} className="space-y-4">
          {/* Datos del propietario */}
          <div className="space-y-2 border-b pb-3">
            <Text size="sm">
              <Text as="span" font="semi" size="sm">
                {t("nombre")}:
              </Text>{" "}
              {selectedUser.user.name}
            </Text>
            <Text size="sm">
              <Text as="span" font="semi" size="sm">
                {t("apellido")}:
              </Text>{" "}
              {selectedUser.user.lastName}
            </Text>
            <Text size="sm">
              <Text as="span" font="semi" size="sm">
                {t("torre")}:
              </Text>{" "}
              {selectedUser.tower}
            </Text>
            <Text size="sm">
              <Text as="span" font="semi" size="sm">
                {t("numeroInmuebleResidencial")}:
              </Text>{" "}
              {selectedUser.apartment}
            </Text>
            <Text size="sm">
              <Text as="span" font="semi" size="sm">
                {t("numeroPlaca")}:
              </Text>{" "}
              {selectedUser.plaque}
            </Text>
          </div>

          {/* Formulario */}
          {!isSideNewOpen && (
            <form onSubmit={onSubmit}>
              <div className="space-y-3">
                <SelectField
                  helpText="Motivo"
                  sizeHelp="xs"
                  rounded="lg"
                  inputSize="sm"
                  defaultOption="Motivo"
                  options={options}
                  onChange={(e) =>
                    handleSelectChange(e.target.value as FeeType)
                  }
                />
                {selectedType === FeeType.OTRO && (
                  <InputField
                    type="text"
                    placeholder="Especifique el motivo"
                    sizeHelp="xs"
                    rounded="lg"
                    inputSize="sm"
                    value={customType}
                    {...register("type")}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}

                <InputField
                  tKeyHelpText={t("valorCuota")}
                  tKeyPlaceholder={t("valorCuota")}
                  placeholder="Valor de cuota"
                  helpText="Valor de cuota"
                  sizeHelp="xs"
                  rounded="lg"
                  inputSize="sm"
                  type="number"
                  {...register("amount")}
                />

                {/* DatePicker de MUI para fecha de vencimiento */}
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label={t("fechaVencimiento")}
                    value={dueDate}
                    onChange={(date) => {
                      setDueDate(date);
                      setValue(
                        "dueDate",
                        date ? date.toISOString().split("T")[0] : ""
                      );
                    }}
                    minDate={new Date()} // opcional: no permitir fechas pasadas
                    enableAccessibleFieldDOMStructure={false} // <-- importante
                    slots={{ textField: TextField }}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        sx: {
                          backgroundColor: "#e5e7eb",
                          borderRadius: "0.375rem",
                        },
                      },
                    }}
                  />
                </LocalizationProvider>

                <TextAreaField
                  placeholder="Descripción"
                  className="mt-2 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  {...register("description")}
                  value={description}
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
          )}
          {isSideNewOpen && <PayUserForm />}
        </div>
      ) : (
        <div className="py-4">
          {t("noSeleccionado") || "No hay propietario seleccionado"}
        </div>
      )}
    </Modal>
  );
}
