/* eslint-disable @next/next/no-img-element */
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  Buton,
  Button,
  InputField,
  SelectField,
} from "complexes-next-components";
import { useRef, useState } from "react";
import {
  Controller,
  Control,
  UseFormRegister,
  FieldErrors,
} from "react-hook-form";
import { IoCamera, IoImages } from "react-icons/io5";
import { RegisterRequest } from "../services/request/register";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

/** ---- TYPES ---- **/

export interface FamilyMember {
  relation: string;
  nameComplet: string;
  numberId: string;
  email: string;
  dateBorn?: string | null;
  photo?: string;
}

export interface FormValues {
  familyInfo: FamilyMember[];
}

interface FamilyMemberFormProps {
  control: Control<RegisterRequest>;
  register: UseFormRegister<RegisterRequest>;
  index: number;
  remove: (index: number) => void;
  errors: FieldErrors<RegisterRequest>;
}

/** ---- COMPONENT ---- **/

export function FamilyMemberForm({
  control,
  register,
  index,
  remove,
  errors,
}: FamilyMemberFormProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const { indicativeOptions } = useCountryCityOptions();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCamera = async () => {
    setIsCameraOpen(true);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );

      const imageData = canvasRef.current.toDataURL("image/png");
      setPreview(imageData);
      setIsCameraOpen(false);

      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div
      key={language}
      className="items-center flex flex-col md:!flex-row gap-2 mb-2 border-b pb-2"
    >
      {/* campos de texto */}
      <div className="w-full">
        <InputField
          helpText="Relación con el propietario"
          tKeyHelpText={t("relacionPropietario")}
          regexType="letters"
          sizeHelp="xxs"
          inputSize="sm"
          rounded="md"
          className="mt-2"
          type="text"
          {...register(`familyInfo.${index}.relation`)}
        />

        <InputField
          helpText="Nombre completo"
          className="mt-2"
          regexType="letters"
          sizeHelp="xxs"
          inputSize="sm"
          rounded="md"
          type="text"
          {...register(`familyInfo.${index}.nameComplet`)}
        />

        <InputField
          helpText="Número de identificación"
          regexType="number"
          sizeHelp="xxs"
          inputSize="sm"
          rounded="md"
          className="mt-2"
          type="text"
          {...register(`familyInfo.${index}.numberId`)}
        />

        <InputField
          helpText="Correo electrónico"
          sizeHelp="xxs"
          inputSize="sm"
          rounded="md"
          className="mt-2"
          type="email"
          {...register(`familyInfo.${index}.email`)}
        />

        <SelectField
          searchable
          regexType="alphanumeric"
          defaultOption="Indicativo"
          helpText="Indicativo"
          sizeHelp="xxs"
          id="indicative"
          options={indicativeOptions}
          inputSize="sm"
          rounded="md"
          {...register(`familyInfo.${index}.indicative`)}
          hasError={!!errors.indicative}
          errorMessage={errors.indicative?.message}
        />

        <InputField
          helpText="Celular"
          sizeHelp="xxs"
          inputSize="sm"
          rounded="md"
          className="mt-2"
          type="text"
          {...register(`familyInfo.${index}.phones`)}
        />

        <div className="w-full mt-2">
          <Controller
            control={control}
            name={`familyInfo.${index}.dateBorn`}
            render={({ field }) => {
              const dateValue: Date | null =
                field.value && typeof field.value === "string"
                  ? new Date(field.value)
                  : null;

              return (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="fecha nacimiento"
                    value={dateValue}
                    onChange={(newDate: Date | null) => {
                      field.onChange(
                        newDate ? newDate.toISOString().split("T")[0] : null,
                      );
                    }}
                    views={["year", "month", "day"]}
                    format="yyyy-MM-dd"
                    slotProps={{
                      textField: {
                        size: "medium",
                        fullWidth: true,
                        error: !!errors.familyInfo?.[index]?.dateBorn,
                        helperText:
                          errors.familyInfo?.[index]?.dateBorn?.message || "",
                        InputProps: {
                          sx: {
                            backgroundColor: "#e5e7eb",
                            borderRadius: "40px",
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: "none",
                            },
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              );
            }}
          />
        </div>
      </div>

      {/* columna imagen */}
      <div className="w-full border-x-4 p-2 flex flex-col items-center">
        {!preview && !isCameraOpen && (
          <>
            <IoImages
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer text-gray-200 w-24 h-24 sm:w-48 sm:h-48 md:w-60  md:h-60"
            />

            <Buton
              borderWidth="none"
              colVariant="warning"
              type="button"
              onClick={openCamera}
            >
              <IoCamera className="mr-1" size={30} />
            </Buton>
          </>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        {isCameraOpen && (
          <>
            <video
              ref={videoRef}
              className="w-full border rounded-md aspect-video"
            />
            <Button onClick={takePhoto}>Capturar</Button>
          </>
        )}

        {preview && (
          <>
            <img
              src={preview}
              width={400}
              height={150}
              alt="Vista previa"
              className="rounded-md border"
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={openCamera}>
                Tomar otra
              </Button>
              <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                Cambiar imagen
              </Button>
            </div>
          </>
        )}
      </div>

      <Button
        type="button"
        size="sm"
        colVariant="danger"
        onClick={() => remove(index)}
      >
        Eliminar
      </Button>
    </div>
  );
}
