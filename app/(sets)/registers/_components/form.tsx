"use client";
import React, { useRef, useState } from "react";
import {
  InputField,
  SelectField,
  Text,
  Button,
  Tooltip,
  Buton,
  // Flag,
} from "complexes-next-components";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import Image from "next/image";
import useForm from "./use-form";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { IoCamera, IoImages } from "react-icons/io5";
import { useCountryCityOptions } from "./register-option";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { TbLivePhotoFilled } from "react-icons/tb";
import { GiReturnArrow } from "react-icons/gi";

export default function Form() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Error abriendo cámara:", err);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        const imageData = canvasRef.current.toDataURL("image/png");

        // convertir base64 a File
        fetch(imageData)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "foto.png", { type: "image/png" });
            setValue("file", file, { shouldValidate: true });
          });

        setPreview(imageData);
        setIsCameraOpen(false);

        // detener la cámara
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach((track) => track.stop());
      }
    }
  };
  const {
    register,
    setValue,
    formState: { errors },
    // isSuccess,
    handleSubmit,
  } = useForm();
  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    } else {
      setPreview(null);
    }
  };

  const {
    countryOptions,
    cityOptions,
    setSelectedCountryId,
    indicativeOptions,
  } = useCountryCityOptions();
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div key={language} className="border-2 p-5 rounded-md mt-3 w-full">
      <div className="w-full flex gap-2 justify-center mt-2">
        <form className="w-full" onSubmit={handleSubmit}>
          <section className="md:!flex-row w-full flex  gap-4">
            <div className="w-full">
              <InputField
                placeholder="Nombre"
                helpText="nombre"
                inputSize="md"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("name")}
                hasError={!!errors.name}
                errorMessage={errors.name?.message}
              />
              <InputField
                placeholder="Apellido"
                helpText="Apellido"
                inputSize="md"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("lastName")}
                hasError={!!errors.lastName}
                errorMessage={errors.lastName?.message}
              />
              <InputField
                placeholder="Número de identificación"
                helpText="Número de identificación"
                inputSize="md"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("numberId")}
                hasError={!!errors.numberId}
                errorMessage={errors.numberId?.message}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t("nacimiento")}
                  value={birthDate}
                  onChange={(newDate) => {
                    setBirthDate(newDate);
                    setValue("bornDate", String(newDate), {
                      shouldValidate: true,
                    });
                  }}
                  views={["year", "month", "day"]}
                  format="yyyy-MM-dd"
                  slotProps={{
                    textField: {
                      size: "medium",
                      fullWidth: true,
                      error: !!errors.bornDate,
                      helperText: errors.bornDate?.message || "",
                      InputProps: {
                        sx: {
                          backgroundColor: "#e5e7eb",
                          borderRadius: "0.375rem",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
              <SelectField
                className="mt-2"
                searchable
                defaultOption="Pais"
                helpText="Pais"
                id="ofert"
                options={countryOptions}
                inputSize="lg"
                rounded="md"
                {...register("country")}
                onChange={(e) => {
                  setSelectedCountryId(e.target.value || null);
                  setValue("country", e.target.value, {
                    shouldValidate: true,
                  });
                }}
                hasError={!!errors.country}
                errorMessage={errors.country?.message}
              />

              {/* Ciudad */}
              <SelectField
                className="mt-2"
                searchable
                defaultOption="Ciudad"
                helpText="Cuidad"
                id="ofert"
                options={cityOptions}
                inputSize="lg"
                rounded="md"
                {...register("city")}
                onChange={(e) => {
                  setValue("city", e.target?.value || "", {
                    shouldValidate: true,
                  });
                }}
                hasError={!!errors.city}
                errorMessage={errors.city?.message}
              />
              <div className="block md:!flex items-center gap-3 mt-2">
                <SelectField
                  tKeyDefaultOption={t("indicativo")}
                  tKeyHelpText={t("indicativo")}
                  searchable
                  regexType="alphanumeric"
                  defaultOption="Indicativo"
                  helpText="Indicativo"
                  sizeHelp="xxs"
                  id="indicative"
                  options={indicativeOptions}
                  inputSize="sm"
                  rounded="md"
                  {...register("indicative")}
                  onChange={(e) => {
                    setValue("indicative", e.target.value, {
                      shouldValidate: true,
                    });
                  }}
                  tKeyError={t("idicativoRequerido")}
                  hasError={!!errors.indicative}
                  errorMessage={errors.indicative?.message}
                />
                <InputField
                  required
                  tKeyHelpText={t("celular")}
                  tKeyPlaceholder={t("celular")}
                  placeholder="Celular"
                  helpText="Celular"
                  regexType="phone"
                  sizeHelp="xxs"
                  inputSize="sm"
                  rounded="md"
                  type="text"
                  {...register("phone", {
                    required: t("celularRequerido"),
                    pattern: {
                      value: /^[0-9]+$/,
                      message: t("soloNumeros"),
                    },
                  })}
                  tKeyError={t("celularRequerido")}
                  hasError={!!errors.phone}
                  errorMessage={errors.phone?.message}
                />
              </div>
              <InputField
                placeholder="correo electronico"
                helpText="correo electronico"
                inputSize="md"
                rounded="md"
                className="mt-2"
                type="email"
                {...register("email")}
                hasError={!!errors.email}
                errorMessage={errors.email?.message}
              />
            </div>
            <div className="w-full mt-4 justify-center items-center border-x-4 border-gray-300 p-2">
              {!preview && !isCameraOpen && (
                <div className="flex flex-col items-center gap-2">
                  <IoImages
                    onClick={handleIconClick}
                    className="cursor-pointer text-gray-200 w-24 h-24 sm:w-48 sm:h-48 md:w-60  md:h-60"
                  />
                  <div className="justify-center items-center">
                    <Text size="md">Imagen del usuario</Text>
                    <Text colVariant="primary" size="md" tKey={t("solo")}>
                      solo archivos png - jpg
                    </Text>
                  </div>
                  <Tooltip
                    content="Tomar foto"
                    tKey={t("tomarFoto")}
                    position="left"
                    className="bg-gray-200"
                  >
                    <Buton
                      size="sm"
                      type="button"
                      borderWidth="none"
                      colVariant="warning"
                      className="flex gap-4 items-center"
                      onClick={openCamera}
                    >
                      <IoCamera className="mr-1" size={30} />
                    </Buton>
                  </Tooltip>
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
                      <GiReturnArrow
                        onClick={() => setIsCameraOpen(false)}
                        className="mt-4 cursor-pointer text-red-800 hover:text-gray-200"
                        size={35}
                      />
                    </Tooltip>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={200}
                    className="hidden"
                  />
                </div>
              )}

              {preview && (
                <div className="mt-3">
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
                    colVariant="warning"
                    onClick={handleIconClick}
                  >
                    Cambiar foto
                  </Button>
                </div>
              )}
            </div>
          </section>
          <section className="flex flex-col md:flex-row gap-4 mt-2">
            <div className="w-50%">
              <div className="flex items-center mt-3 gap-2">
                <input type="checkbox" {...register("termsConditions")} />
                <button
                  onClick={() => {
                    router.push(route.termsConditions);
                  }}
                >
                  términos y condiciones
                </button>
              </div>
              {errors.termsConditions && (
                <Text size="sm" colVariant="danger">
                  {errors.termsConditions.message}
                </Text>
              )}
            </div>
          </section>
          <Button
            colVariant="success"
            size="full"
            rounded="md"
            type="submit"
            className="mt-2"
          >
            Registrarse
          </Button>
        </form>
      </div>
    </div>
  );
}
