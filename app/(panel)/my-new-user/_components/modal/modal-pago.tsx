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
// import { PayUserForm } from "./adminfeePay";
import { useUiStore } from "./store/new-store";
import { FeeType } from "../../services/request/adminFee";
import useFormInfo from "./use-form-info";
import { IoDocumentAttach } from "react-icons/io5";
import { useLanguage } from "@/app/hooks/useLanguage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedUser?: EnsembleResponse | null;
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

  const {
    register,
    handleSubmit,
    isSuccess,
    setValue,
    formState: { errors },
  } = useFormPayUser(String(selectedUser?.id));
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

  const { fileInputRef, preview, setPreview, handleIconClick } = useFormInfo();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
      const fileURL = URL.createObjectURL(file);
      setPreview(fileURL);
    } else {
      setPreview(null);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      closeOnOverlayClick={false}
      onClose={onClose}
      title={title}
      className="w-[900px]"
    >
      {selectedUser ? (
        <div
          key={language}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto pr-2"
        >
          {/* ===================== */}
          {/* DATOS DEL PROPIETARIO */}
          {/* ===================== */}
          <div className="md:col-span-1 bg-gray-50 rounded-xl p-4 border space-y-4">
            <Text font="semi" size="sm" className="text-gray-700">
              Información del propietario
            </Text>

            {[
              { label: t("nombre"), value: selectedUser.user.name },
              { label: t("apellido"), value: selectedUser.user.lastName },
              { label: t("torre"), value: selectedUser.tower },
              {
                label: t("numeroInmuebleResidencial"),
                value: selectedUser.apartment,
              },
              { label: t("numeroPlaca"), value: selectedUser.plaque },
            ].map((item) => (
              <div key={item.label} className="text-sm">
                <span className="text-gray-500">{item.label}</span>
                <div className="font-medium text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>

          {/* ============ */}
          {/* FORMULARIO */}
          {/* ============ */}
          {!isSideNewOpen && (
            <div className="md:col-span-2 bg-white rounded-xl p-6 border shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Motivo */}
                <SelectField
                  helpText="Motivo"
                  sizeHelp="xs"
                  rounded="lg"
                  inputSize="md"
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
                    regexType="letters"
                    value={customType}
                    {...register("type")}
                    onChange={(e) => setCustomType(e.target.value)}
                  />
                )}

                {/* Valores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    placeholder="Valor de cuota"
                    helpText="Valor de cuota"
                    sizeHelp="xs"
                    rounded="md"
                    inputSize="sm"
                    regexType="number"
                    {...register("amount")}
                  />

                  <InputField
                    placeholder="Valor a pagar"
                    helpText="Valor a pagar"
                    sizeHelp="xs"
                    rounded="md"
                    inputSize="sm"
                    regexType="number"
                    {...register("valuepay")}
                  />
                </div>

                {/* Fecha */}
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label={t("fechaVencimiento")}
                    value={dueDate}
                    onChange={(date) => {
                      setDueDate(date);
                      setValue(
                        "dueDate",
                        date ? date.toISOString().split("T")[0] : "",
                      );
                    }}
                    minDate={new Date()}
                    enableAccessibleFieldDOMStructure={false}
                    slots={{ textField: TextField }}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        sx: {
                          backgroundColor: "#f9fafb",
                          borderRadius: "0.5rem",
                        },
                      },
                    }}
                  />
                </LocalizationProvider>

                {/* Descripción */}
                <TextAreaField
                  placeholder="Descripción"
                  rows={4}
                  {...register("description")}
                  value={description}
                  className="w-full rounded-md border bg-gray-50 px-3 py-2 text-sm"
                />

                {/* PDF */}
                <div className="border border-dashed rounded-lg p-6 text-center bg-gray-50">
                  {!preview ? (
                    <>
                      <IoDocumentAttach
                        size={40}
                        onClick={handleIconClick}
                        className="mx-auto cursor-pointer text-gray-400 hover:text-blue-500 transition"
                      />
                      <Text size="xs" className="text-gray-500 mt-2">
                        Solo archivos PDF
                      </Text>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <iframe
                        src={preview}
                        className="w-full h-40 border rounded"
                        title="Previsualización PDF"
                      />
                      <Button
                        size="sm"
                        colVariant="primary"
                        onClick={handleIconClick}
                      >
                        Cambiar PDF
                      </Button>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />

                  {errors.file && (
                    <Text size="xs" colVariant="danger">
                      {errors.file.message}
                    </Text>
                  )}
                </div>

                {/* Botón */}
                <Button
                  colVariant="warning"
                  size="full"
                  rounded="lg"
                  type="submit"
                  disabled={isSuccess}
                >
                  Registrar pago
                </Button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="py-6 text-center text-gray-500">
          {t("noSeleccionado") || "No hay propietario seleccionado"}
        </div>
      )}
    </Modal>
  );
}
