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
import { useUiStore } from "./store/new-store";
import { FeeType } from "../../services/request/adminFee";
import useFormInfo from "./use-form-info";
import { IoDocumentAttach } from "react-icons/io5";
import { useLanguage } from "@/app/hooks/useLanguage";
import useFeePaymentsTable from "@/app/(panel)/my-fees/_components/useActivitTable";
import { AdminFeePayment } from "@/app/(panel)/my-fees/services/admin-fee-payment";
import { ConjuntoBankAccount } from "@/app/(panel)/my-fees/services/bankUnitService";
import { useHasBankAccount } from "@/app/(panel)/my-fees/_components/useHasBankAccount";

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
  const { data: fees } = useFeePaymentsTable();
  const [selectedType, setSelectedType] = useState<FeeType | null>(null);
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [selectedFee, setSelectedFee] = useState<AdminFeePayment | null>(null);
  const { data: bank = [] } = useHasBankAccount();

  const hasInitialBalance =
    selectedUser?.adminFees?.some(
      (fee) => fee.type === FeeType.SALDO_INICIAL,
    ) ?? false;

  const handleFeeSelect = (feeId: string) => {
    const fee = fees.find((f) => f.id === feeId);
    if (!fee) return;

    setSelectedFee(fee);

    const amount = fee.amount ?? 0;

    setValue("amount", amount);
    setValue("valuepay", String(amount));
    setValue("type", fee.feeType as FeeType);
    setValue("customName", fee.feeType ?? "");

    if (fee.lastPaymentDate) {
      const date = new Date(fee.lastPaymentDate);
      setDueDate(date);
      setValue("dueDate", fee.lastPaymentDate);
    }

    const desc = `Pago correspondiente a ${fee.feeType ?? "cuota"}`;
    setDescription(desc);
    setValue("description", desc);
  };

  const defaultDescriptions: Record<FeeType, string> = {
    [FeeType.SALDO_INICIAL]: "Saldo inicial del usuario.",
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
      className="w-[1200px]"
    >
      {selectedUser ? (
        <div
          key={language}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto pr-2"
        >
          <div className="md:col-span-1 bg-gray-50 rounded-xl p-2 border space-y-2">
            <Text font="semi" size="sm">
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

          {!isSideNewOpen && (
            <div className="md:col-span-2 bg-white rounded-xl p-4 border shadow-sm">
              <form key={language} onSubmit={handleSubmit}>
                <div className="p-2">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FORMULARIO */}
                    <div className="lg:col-span-2 space-y-2">
                      {/* SELECT */}
                      {hasInitialBalance && (
                        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <span>⚠️</span>
                          <span>
                            El saldo inicial ya fue registrado para este
                            usuario.
                          </span>
                        </div>
                      )}
                      <SelectField
                        helpText="Cuota a pagar"
                        defaultOption="Seleccionar cuota"
                        options={[
                          ...(!hasInitialBalance
                            ? [
                                {
                                  value: FeeType.SALDO_INICIAL,
                                  label:
                                    defaultDescriptions[FeeType.SALDO_INICIAL],
                                },
                              ]
                            : []),
                          ...fees.map((fee) => ({
                            value: fee.id,
                            label: `${fee.feeType ?? "Cuota"} - $${(
                              fee.amount ?? 0
                            ).toLocaleString()}`,
                          })),
                        ]}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === FeeType.SALDO_INICIAL) {
                            setSelectedFee(null);
                            setSelectedType(FeeType.SALDO_INICIAL);

                            setValue("type", FeeType.SALDO_INICIAL);
                            setValue("customName", FeeType.SALDO_INICIAL);
                            setValue("amount", 0);
                            setValue("valuepay", "0");

                            setDescription(
                              defaultDescriptions[FeeType.SALDO_INICIAL],
                            );
                            setValue(
                              "description",
                              defaultDescriptions[FeeType.SALDO_INICIAL],
                            );

                            return;
                          }

                          handleFeeSelect(value);
                        }}
                      />

                      {selectedFee && (
                        <div className="flex gap-6">
                          {/* IZQUIERDA - INFO CUOTA */}
                          <div className="w-1/2 bg-white border rounded-xl p-4 shadow-sm space-y-2">
                            <Text size="sm">
                              <b>Tipo:</b>{" "}
                              {selectedFee.feeType ?? "No definido"}
                            </Text>

                            <Text size="sm">
                              <b>Monto:</b> $
                              {(selectedFee.amount ?? 0).toLocaleString()}
                            </Text>

                            <Text size="sm">
                              <b>Vence:</b>{" "}
                              {selectedFee.lastPaymentDate ?? "No definido"}
                            </Text>
                          </div>

                          {/* DIVISOR VERTICAL */}
                          <div className="w-px bg-gray-300" />

                          {/* DERECHA - BANCOS */}
                          <div className="w-1/2 max-h-[200px] overflow-y-auto pr-2">
                            {bank.length === 0 ? (
                              <Text size="sm">No hay cuentas bancarias</Text>
                            ) : (
                              (bank as ConjuntoBankAccount[]).map((b) => (
                                <div
                                  key={b.id}
                                  className="mb-4 text-sm text-gray-700"
                                >
                                  <Text size="sm">
                                    <b>Banco:</b> {b.bankName}
                                  </Text>
                                  <Text size="sm">
                                    <b>Número:</b> {b.accountNumber}
                                  </Text>
                                  <Text size="sm">
                                    <b>Tipo:</b> {b.accountType}
                                  </Text>
                                  <Text size="sm">
                                    <b>Estado:</b>{" "}
                                    {b.isActive ? "Activo" : "Inactivo"}
                                  </Text>

                                  <div className="flex gap-2 mt-2">
                                    {b.isPrimary && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        Principal
                                      </span>
                                    )}
                                  </div>

                                  <hr className="mt-3" />
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {/* VALORES */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          placeholder={t("valorCuota")}
                          helpText={t("valorCuota")}
                          inputSize="sm"
                          regexType="number"
                          {...register("amount")}
                        />

                        <InputField
                          placeholder={t("valorPagar")}
                          helpText={t("valorPagar")}
                          inputSize="sm"
                          regexType="number"
                          {...register("valuepay")}
                        />
                      </div>

                      {/* FECHA */}
                      <div className="space-y-2">
                        <Text size="sm" className="text-gray-600">
                          {t("fechaVencimiento")}
                        </Text>

                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            value={dueDate}
                            onChange={(date) => {
                              setDueDate(date);
                              setValue(
                                "dueDate",
                                date ? date.toISOString().split("T")[0] : "",
                              );
                            }}
                            enableAccessibleFieldDOMStructure={false}
                            slots={{ textField: TextField }}
                            slotProps={{
                              textField: {
                                size: "small",
                                fullWidth: true,
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </div>

                      {/* DESCRIPCIÓN */}
                      <div className="space-y-2">
                        <Text size="sm" className="text-gray-600">
                          {t("descripcion")}
                        </Text>

                        <TextAreaField
                          rows={4}
                          {...register("description")}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>

                      {/* BOTÓN */}
                      <Button
                        colVariant="primary"
                        size="full"
                        rounded="lg"
                        type="submit"
                        disabled={isSuccess}
                      >
                        Registrar Pago
                      </Button>
                    </div>

                    {/* PDF EXACTAMENTE IGUAL AL PRIMERO */}
                    {selectedType && (
                      <div className="space-y-4">
                        <Text size="sm" className="text-gray-600">
                          {t("adjuntarArchivo")}
                        </Text>

                        {!preview ? (
                          <div
                            onClick={handleIconClick}
                            className="h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all p-6"
                          >
                            <IoDocumentAttach
                              size={50}
                              className="text-gray-400 mb-3"
                            />

                            <Text
                              size="sm"
                              className="text-gray-600 text-center"
                            >
                              {t("subirPdf")}
                            </Text>

                            <Text size="xs" className="text-gray-400 mt-1">
                              PDF • Máx recomendado 5MB
                            </Text>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <iframe
                              src={preview}
                              className="w-full h-[300px] rounded-xl border shadow-sm"
                              title="Previsualización PDF"
                            />

                            <Button
                              colVariant="success"
                              size="sm"
                              type="button"
                              onClick={handleIconClick}
                            >
                              {t("cambiarArchivo")}
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
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="py-4 text-center text-gray-500">
          {t("noSeleccionado") || "No hay propietario seleccionado"}
        </div>
      )}
    </Modal>
  );
}
