import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  Button,
  InputField,
  SelectField,
  Text,
  Tooltip,
} from "complexes-next-components";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  Controller,
  Control,
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import {
  IoCamera,
  IoImages,
  IoReturnDownBackOutline,
} from "react-icons/io5";
import { TbLivePhotoFilled } from "react-icons/tb";
import { RegisterRequest } from "../services/request/register";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { validatePersonImage } from "@/app/helpers/faceDetection";

export interface FamilyMember {
  relation: string;
  nameComplet: string;
  lastComplet: string;
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
  setValue: UseFormSetValue<RegisterRequest>;
  index: number;
  remove: (index: number) => void;
  errors: FieldErrors<RegisterRequest>;
}

export function FamilyMemberForm({
  control,
  register,
  setValue,
  index,
  remove,
  errors,
}: FamilyMemberFormProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const {
    indicativeOptions,
    countryOptions,
    cityOptions,
    setSelectedCountryId,
  } = useCountryCityOptions();

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

  const takePhoto = async () => {
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

      const blob = await fetch(imageData).then((res) => res.blob());
      const file = new File([blob], "foto.png", { type: "image/png" });

      const hasPerson = await validatePersonImage(file);
      if (!hasPerson) {
        alert("Debes usar una imagen donde se vea una persona");
        return;
      }

      setPreview(imageData);
      setIsCameraOpen(false);

      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const hasPerson = await validatePersonImage(file);
    if (!hasPerson) {
      alert("Debes usar una imagen donde se vea una persona");
      e.target.value = "";
      return;
    }

    setPreview(URL.createObjectURL(file));
  };

  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div
      key={language}
      className="items-center flex flex-col md:!flex-row gap-2 mb-2 border-b pb-2"
    >
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
          helpText="Apellido completo"
          className="mt-2"
          regexType="letters"
          sizeHelp="xxs"
          inputSize="sm"
          rounded="md"
          type="text"
          {...register(`familyInfo.${index}.lastComplet`)}
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
        <div className="mt-2">
          <SelectField
            tKeyDefaultOption={t("pais")}
            tKeyHelpText={t("pais")}
            defaultOption="Pais"
            helpText="Pais"
            sizeHelp="xs"
            id="country"
            searchable
            regexType="alphanumeric"
            options={countryOptions}
            inputSize="md"
            rounded="md"
            {...register("country")}
            onChange={(e) => {
              const value = e.target.value;

              setSelectedCountryId(value);

              setValue(`familyInfo.${index}.country`, value, {
                shouldValidate: true,
              });

              // limpiar ciudad
              setValue(`familyInfo.${index}.city`, "");
            }}
            hasError={!!errors.country}
            errorMessage={errors.country?.message}
          />
        </div>
        <div className="mt-2">
          <SelectField
            tKeyDefaultOption={t("ciudad")}
            tKeyHelpText={t("ciudad")}
            defaultOption="Ciudad"
            searchable
            helpText="Ciudad"
            sizeHelp="xs"
            regexType="alphanumeric"
            id="city"
            options={cityOptions}
            inputSize="md"
            rounded="md"
            {...register("city")}
            onChange={(e) => {
              setValue(`familyInfo.${index}.city`, e.target.value, {
                shouldValidate: true,
              });
            }}
            hasError={!!errors.city}
            errorMessage={errors.city?.message}
          />
        </div>

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
          className="mt-2"
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
                            borderRadius: "20px",
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

      <div className="w-full bg-gray-50/40 border border-gray-200 rounded-2xl p-4 flex flex-col items-center">
        {!preview && !isCameraOpen && (
          <div className="flex flex-col items-center gap-2">
            <IoImages
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer text-gray-400 hover:text-cyan-600 transition w-24 h-24 sm:w-48 sm:h-48 md:w-60  md:h-60"
            />
            <Button
              size="sm"
              rounded="md"
              type="button"
              colVariant="success"
              className="flex gap-4 items-center"
              onClick={openCamera}
            >
              <IoCamera className="mr-1" size={40} />
              <Text size="sm" tKey={t("tomarFoto")} translate="yes">
                Tomar foto
              </Text>
            </Button>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        {isCameraOpen && (
          <div className="flex flex-col items-center">
            <video
              ref={videoRef}
              className="w-full max-w-3xl border rounded-md aspect-video"
            />
            <div className="flex gap-16">
              <Tooltip
                content="Tomar foto"
                tKey={t("tomarFoto")}
                position="bottom"
                className="bg-gray-200 w-32"
              >
                <TbLivePhotoFilled
                  onClick={takePhoto}
                  className="mt-4 cursor-pointer text-cyan-800 hover:text-gray-200"
                  size={45}
                />
              </Tooltip>

              <Tooltip
                content="Cancelar"
                tKey={t("cancelar")}
                position="bottom"
                className="bg-gray-200 w-32"
              >
                <div className="bg-white/20 p-2 rounded-full cursor-pointer">
                  <IoReturnDownBackOutline
                    size={30}
                    color="white"
                    className="cursor-pointer"
                    onClick={() => setIsCameraOpen(false)}
                  />
                </div>
              </Tooltip>
            </div>
            <canvas ref={canvasRef} width={300} height={200} className="hidden" />
          </div>
        )}

        {preview && (
          <div className="mt-3 gap-5">
            <Image
              src={preview}
              width={900}
              height={600}
              alt="Vista previa"
              className="rounded-md border"
            />
            <Button
              size="sm"
              type="button"
              className="mt-2"
              colVariant="primary"
              onClick={openCamera}
            >
              Tomar otra
            </Button>
            <Button
              size="sm"
              type="button"
              colVariant="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Cambiar imagen
            </Button>
          </div>
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
