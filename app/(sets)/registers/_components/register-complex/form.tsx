"use client";
import React, { useRef, useState } from "react";
import {
  InputField,
  SelectField,
  Text,
  Button,
  Tooltip,
  Title,
  Buton,
} from "complexes-next-components";
import useForm from "./use-form";
import { route } from "@/app/_domain/constants/routes";
import { IoCamera, IoImages, IoReturnDownBackOutline } from "react-icons/io5";

import Image from "next/image";
import { useCountryCityOptions } from "../register-option";
import { useTranslation } from "react-i18next";
import "react-datepicker/dist/react-datepicker.css";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { TbLivePhotoFilled } from "react-icons/tb";
import { phoneLengthByCountry } from "@/app/helpers/longitud-telefono";
import { useLanguage } from "@/app/hooks/useLanguage";
import { AlertFlag } from "@/app/components/alertFalg";

export default function FormComplex() {
  const [preview, setPreview] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    register,
    setValue,
    formState: { errors },
    onSubmit,
    handleIconClick,
    fileInputRef,
  } = useForm();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    } else {
      setPreview(null);
    }

    // ✅ limpiar para permitir volver a seleccionar
    e.target.value = "";
  };

  const {
    countryOptions,
    cityOptions,
    indicativeOptions,
    setSelectedCountryId,
  } = useCountryCityOptions();

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

  const { t } = useTranslation();
  const { language } = useLanguage();

  const [maxLengthCellphone, setMaxLengthCellphone] = useState<
    number | undefined
  >(undefined);
  return (
    <div key={language} className="border-2 p-5 rounded-md mt-3 w-full">
      <div className="w-full gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <Title
          as="h3"
          size="sm"
          colVariant="on"
          font="semi"
          tKey={t("representante")}
        >
          Información del representante de unidad residencial
        </Title>
      </div>
      <div className="w-full flex gap-2 justify-center ">
        <form onSubmit={onSubmit} className="w-full">
          <div className="flex flex-col gap-4 md:!flex-row justify-around w-full">
            <section className="w-full">
              <InputField
                tKeyHelpText={t("nombreadmin")}
                tKeyPlaceholder={t("nombreadmin")}
                placeholder="Nombre administrador(Representante)"
                helpText="Nombre administrador(Representante)"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                regexType="letters"
                className="mt-2"
                type="text"
                {...register("name")}
                tKeyError={t("nombreadminRequerido")}
                hasError={!!errors.name}
                errorMessage={errors.name?.message}
              />
              <InputField
                tKeyHelpText={t("apellidoadmin")}
                tKeyPlaceholder={t("apellidoadmin")}
                placeholder="Apellido administrador(Representante)"
                helpText="Apellido administrador(Representante)"
                sizeHelp="sm"
                regexType="letters"
                inputSize="md"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("lastName")}
                tKeyError={t("apellidoadminRequerido")}
                hasError={!!errors.lastName}
                errorMessage={errors.lastName?.message}
              />

              <InputField
                tKeyHelpText={t("correo")}
                tKeyPlaceholder={t("correo")}
                placeholder="Correo electronico"
                helpText="Correo electronico"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                className="mt-2"
                type="email"
                {...register("email")}
                tKeyError={t("correoSolicitado")}
                hasError={!!errors.email}
                errorMessage={errors.email?.message}
              />

              <div className="flex gap-2 mt-2">
                <InputField
                  tKeyHelpText={t("docuemtno")}
                  tKeyPlaceholder={t("docuemtno")}
                  placeholder="Documento de identidad(cedula-pasaporte)"
                  helpText="Documento de identidad(cedula-pasaporte)"
                  sizeHelp="sm"
                  regexType="number"
                  inputSize="sm"
                  rounded="md"
                  type="text"
                  {...register("numberId")}
                  tKeyError={t("documentoRequerido")}
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
              </div>

              <div className="mt-2 block md:flex gap-4 w-full">
                <div className="w-full md:w-1/2">
                  <SelectField
                    searchable
                    tKeyHelpText={t("seleccionpais")}
                    tKeyDefaultOption={t("seleccionpais")}
                    defaultOption="Pais"
                    helpText="Pais"
                    regexType="letters"
                    sizeHelp="sm"
                    id="country"
                    options={countryOptions}
                    inputSize="md"
                    rounded="md"
                    {...register("country")}
                    onChange={(e) => {
                      setSelectedCountryId(e.target.value || null);
                      setValue("country", e.target.value, {
                        shouldValidate: true,
                      });
                    }}
                    tKeyError={t("paisRequerido")}
                    hasError={!!errors.country}
                    errorMessage={errors.country?.message}
                  />
                </div>

                <div className="w-full md:w-1/2">
                  <SelectField
                    searchable
                    tKeyHelpText={t("seleccionaciudad")}
                    tKeyDefaultOption={t("seleccionaciudad")}
                    defaultOption="Ciudad"
                    helpText="Ciudad"
                    regexType="alphanumeric"
                    id="city"
                    sizeHelp="sm"
                    options={cityOptions}
                    inputSize="md"
                    rounded="md"
                    {...register("city")}
                    onChange={(e) => {
                      setValue("city", e.target?.value || "", {
                        shouldValidate: true,
                      });
                    }}
                    tKeyError={t("ciudadRequerido")}
                    hasError={!!errors.city}
                    errorMessage={errors.city?.message}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <SelectField
                  tKeyDefaultOption={t("indicativo")}
                  tKeyHelpText={t("indicativo")}
                  searchable
                  regexType="alphanumeric"
                  tkeySearch={t("buscarNoticia")}
                  defaultOption="Indicativo"
                  helpText="Indicativo"
                  sizeHelp="sm"
                  inputSize="md"
                  id="indicative"
                  options={indicativeOptions}
                  rounded="md"
                  {...register("indicative")}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setValue("indicative", selected, { shouldValidate: true });

                    const [, countryCode] = selected.split("-");
                    const maxLen =
                      phoneLengthByCountry[
                        countryCode as keyof typeof phoneLengthByCountry
                      ];

                    setMaxLengthCellphone(maxLen);
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
                  regexType="phone"
                  helpText="Celular"
                  sizeHelp="sm"
                  inputSize="sm"
                  rounded="md"
                  type="number"
                  {...register("phone")}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (maxLengthCellphone)
                      value = value.slice(0, maxLengthCellphone);
                    setValue("phone", value, { shouldValidate: true });
                  }}
                  tKeyError={t("celularRequerido")}
                  hasError={!!errors.phone}
                  errorMessage={errors.phone?.message}
                />
              </div>
              <div className="flex items-center mt-3 gap-2">
                <input
                  type="checkbox"
                  {...register("termsConditions")}
                  className="w-6 h-6 accent-cyan-800 cursor-pointer"
                />
                <Buton
                  borderWidth="none"
                  onClick={() => {
                    window.open(route.termsConditions, "_blank");
                  }}
                >
                  <Text
                    tKey={t("terminosCondiciones")}
                    translate="yes"
                    size="sm"
                    colVariant="primary"
                  >
                    Acepto términos y condiciones
                  </Text>
                </Buton>
              </div>
              {errors.termsConditions && (
                <Text
                  tKey={t("terminosRequerido")}
                  size="xs"
                  colVariant="danger"
                >
                  {errors.termsConditions.message}
                </Text>
              )}
            </section>
            <section className="w-full">
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
          </div>
          <Button
            colVariant="warning"
            size="full"
            rounded="md"
            className="mt-4"
            type="submit"
          >
            Registrarse
          </Button>
          <AlertFlag />
        </form>
      </div>
    </div>
  );
}
