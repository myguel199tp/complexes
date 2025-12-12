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
    <Modal isOpen={isOpen} onClose={onClose}>
      <form key={language} onSubmit={handleSubmit}>
        <div className="space-y-3">
          <SelectField
            helpText="Motivo"
            sizeHelp="xs"
            rounded="lg"
            inputSize="md"
            defaultOption="Motivo"
            options={options}
            onChange={(e) => handleSelectChange(e.target.value as FeeType)}
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
              className="w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <InputField
            tKeyHelpText={t("valorCuota")}
            tKeyPlaceholder={t("valorCuota")}
            placeholder="Valor de cuota"
            helpText="Valor de cuota"
            sizeHelp="xs"
            rounded="md"
            inputSize="sm"
            regexType="number"
            type="text"
            {...register("amount")}
          />

          <InputField
            // tKeyHelpText={t("valorCuota")}
            // tKeyPlaceholder={t("valorCuota")}
            placeholder="Valor a pagar"
            helpText="Valor a pagar"
            sizeHelp="xs"
            regexType="number"
            rounded="md"
            inputSize="sm"
            type="text"
            {...register("valuepay")}
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
              minDate={new Date()}
              enableAccessibleFieldDOMStructure={false}
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

        <div className="w-full">
          {!preview && (
            <div className="flex items-center justify-center">
              <IoDocumentAttach
                size={50}
                onClick={handleIconClick}
                className="cursor-pointer text-gray-200"
              />
              <div className="flex justify-center items-center">
                <Text size="sm"> solo archivo PDF </Text>
              </div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="application/pdf"
            onChange={handleFileChange}
          />

          {preview && (
            <div className="mt-3 flex flex-col items-center w-full">
              <iframe
                src={preview}
                width="20%"
                height="20%"
                className="border"
                title="Previsualización PDF"
              />
              <Button
                className="p-2 mt-2"
                colVariant="primary"
                size="sm"
                onClick={handleIconClick}
              >
                Cargar otro PDF
              </Button>
            </div>
          )}

          {errors.file && (
            <Text size="xs" colVariant="danger">
              {errors.file.message}
            </Text>
          )}
        </div>

        <Button
          colVariant="warning"
          size="full"
          rounded="md"
          type="submit"
          className="mt-4"
          disabled={isSuccess}
        >
          Registrar Pago
        </Button>
      </form>
    </Modal>
  );
}
