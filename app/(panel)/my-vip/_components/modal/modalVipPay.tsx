import React, { useState } from "react";
import {
  InputField,
  Modal,
  SelectField,
  TextAreaField,
  Text,
  Button,
} from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { useFormPayUser } from "@/app/(panel)/my-new-user/_components/modal/use-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import useFormInfo from "@/app/(panel)/my-certification/_components/form-info";
import { IoDocumentAttach } from "react-icons/io5";
import { useLanguage } from "@/app/hooks/useLanguage";
import { AdminFeePayment } from "@/app/(panel)/my-fees/services/admin-fee-payment";
import { useHasBankAccount } from "@/app/(panel)/my-fees/_components/useHasBankAccount";
import { ConjuntoBankAccount } from "@/app/(panel)/my-fees/services/bankUnitService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  fees: AdminFeePayment[];
}

export default function ModalVipPay({ isOpen, onClose, id, fees }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { data: bank = [] } = useHasBankAccount();
  const {
    register,
    handleSubmit,
    isSuccess,
    setValue,
    formState: { errors },
  } = useFormPayUser(String(id));

  const [selectedFee, setSelectedFee] = useState<AdminFeePayment | null>(null);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const { fileInputRef, preview, setPreview, handleIconClick } = useFormInfo();

  const handleFeeSelect = (feeId: string) => {
    const fee = fees.find((f) => f.id === feeId);
    if (!fee) return;

    setSelectedFee(fee);

    const amount = fee.amount ?? 0;

    setValue("amount", amount);
    setValue("valuepay", String(amount));

    setValue("type", fee.feeType);

    // 👇 IMPORTANTE
    setValue("customName", fee.feeType);

    if (fee.lastPaymentDate) {
      const date = new Date(fee.lastPaymentDate);

      setDueDate(date);
      setValue("dueDate", fee.lastPaymentDate);
    }

    const desc = `Pago correspondiente a ${fee.feeType ?? "cuota"}`;

    setDescription(desc);
    setValue("description", desc);
  };

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
      title="Registrar pago"
      onClose={onClose}
      className="w-[95%] max-w-5xl max-h-[90vh]"
    >
      <form
        key={language}
        onSubmit={handleSubmit}
        className="overflow-y-auto max-h-[80vh]"
      >
        <input type="hidden" {...register("customName")} />
        <div className="p-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-2">
              {/* SELECT CUOTA */}
              <div className="space-y-2">
                <SelectField
                  helpText="Cuota a pagar"
                  defaultOption="Seleccionar cuota"
                  options={fees.map((fee) => ({
                    value: fee.id,
                    label: `${fee.feeType ?? "Cuota"} - $${(
                      fee.amount ?? 0
                    ).toLocaleString()}`,
                  }))}
                  onChange={(e) => handleFeeSelect(e.target.value)}
                />
              </div>

              {/* INFO CUOTA */}
              {selectedFee && (
                <div className="flex gap-6">
                  {/* IZQUIERDA - INFO CUOTA */}
                  <div className="w-1/2 bg-white border rounded-xl p-4 shadow-sm space-y-2">
                    <Text size="sm">
                      <b>Tipo:</b> {selectedFee.feeType ?? "No definido"}
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
                        <div key={b.id} className="mb-4 text-sm text-gray-700">
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
                            <b>Estado:</b> {b.isActive ? "Activo" : "Inactivo"}
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

              {/* INPUTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  placeholder={t("valorCuota")}
                  helpText={t("valorCuota")}
                  inputSize="sm"
                  regexType="number"
                  type="text"
                  disabled
                  {...register("amount")}
                />

                <InputField
                  placeholder={t("valorPagar")}
                  helpText={t("valorPagar")}
                  inputSize="sm"
                  regexType="number"
                  type="text"
                  {...register("valuepay")}
                />
              </div>

              {/* DATE */}
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
                    className="bg-gray-200"
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

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <Text size="sm" className="text-gray-600">
                  {t("descripcion")}
                </Text>

                <TextAreaField
                  rows={4}
                  {...register("description")}
                  className="bg-gray-200"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* BUTTON */}
              <Button
                colVariant="primary"
                size="full"
                rounded="lg"
                className="mt-4"
                type="submit"
                disabled={isSuccess}
              >
                Registrar Pago
              </Button>
            </div>

            {/* FILE UPLOAD */}
            <div className="space-y-4">
              <Text size="sm" className="text-gray-600">
                {t("adjuntarArchivo")}
              </Text>

              {!preview ? (
                <div
                  onClick={handleIconClick}
                  className="h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all p-6"
                >
                  <IoDocumentAttach size={50} className="text-gray-400 mb-3" />

                  <Text size="sm" className="text-gray-600 text-center">
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
          </div>
        </div>
      </form>
    </Modal>
  );
}
