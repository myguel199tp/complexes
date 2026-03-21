import React, { useState } from "react";
import {
  InputField,
  Modal,
  SelectField,
  TextAreaField,
  Text,
  Button,
} from "complexes-next-components";
import { FeeType } from "@/app/(panel)/my-new-user/services/request/adminFee";
import { useTranslation } from "react-i18next";
import { useFormPayUser } from "@/app/(panel)/my-new-user/_components/modal/use-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import useFormInfo from "@/app/(panel)/my-certification/_components/form-info";
import { IoDocumentAttach } from "react-icons/io5";
import { useLanguage } from "@/app/hooks/useLanguage";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

export default function ModalVipPay({ isOpen, onClose, id }: Props) {
  const [selectedType, setSelectedType] = useState<FeeType | null>(null);
  const { t } = useTranslation();
  const { language } = useLanguage();

  const {
    register,
    handleSubmit,
    isSuccess,
    setValue,
    formState: { errors },
  } = useFormPayUser(String(id));

  const [description, setDescription] = useState<string>("");
  const [customType, setCustomType] = useState<string>("");
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
    <Modal isOpen={isOpen} onClose={onClose} className="w-[60%]">
      <form key={language} onSubmit={handleSubmit}>
        <div className="p-6">
          {/* HEADER */}
          <div className="mb-6">
            <Text size="lg" font="bold">
              {t("registrarPago")}
            </Text>
            <Text size="sm" className="text-gray-500">
              {t("completaInformacionPago")}
            </Text>
          </div>

          {/* LAYOUT PRINCIPAL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FORM LEFT */}
            <div className="lg:col-span-2 space-y-5">
              {/* GRID INPUTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  helpText="Motivo"
                  sizeHelp="xs"
                  rounded="md"
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
                    placeholder={t("especificarMotivo")}
                    sizeHelp="xs"
                    rounded="md"
                    inputSize="md"
                    value={customType}
                    {...register("type")}
                    onChange={(e) => setCustomType(e.target.value)}
                  />
                )}

                <InputField
                  tKeyHelpText={t("valorCuota")}
                  tKeyPlaceholder={t("valorCuota")}
                  placeholder={t("valorCuota")}
                  helpText={t("valorCuota")}
                  sizeHelp="xs"
                  rounded="md"
                  inputSize="md"
                  regexType="number"
                  type="text"
                  {...register("amount")}
                />

                <InputField
                  placeholder={t("valorPagar")}
                  helpText={t("valorPagar")}
                  sizeHelp="xs"
                  regexType="number"
                  rounded="md"
                  inputSize="md"
                  type="text"
                  {...register("valuepay")}
                />
              </div>

              {/* DATE */}
              <div className="space-y-1">
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
                    minDate={new Date()}
                    enableAccessibleFieldDOMStructure={false}
                    slots={{ textField: TextField }}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        sx: {
                          borderRadius: "8px",
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1">
                <Text size="sm" className="text-gray-600">
                  {t("descripcion")}
                </Text>

                <TextAreaField
                  rows={4}
                  {...register("description")}
                  value={description}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* BUTTON */}
              <Button
                colVariant="primary"
                size="full"
                rounded="md"
                type="submit"
                disabled={isSuccess}
              >
                {t("registrarPago")}
              </Button>
            </div>

            {/* RIGHT SIDE - FILE UPLOAD */}
            <div className="space-y-3">
              <Text size="sm" className="text-gray-600">
                {t("adjuntarArchivo")}
              </Text>

              {!preview ? (
                <div
                  onClick={handleIconClick}
                  className="h-full min-h-[260px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition p-6"
                >
                  <IoDocumentAttach size={50} className="text-gray-400 mb-3" />
                  <Text size="sm" className="text-gray-500 text-center">
                    {t("subirPdf")}
                  </Text>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <iframe
                    src={preview}
                    className="w-full h-[260px] rounded-md border"
                    title="Previsualización PDF"
                  />

                  <Button
                    colVariant="warning"
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
