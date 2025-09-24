"use client";
import React, { useRef, useState } from "react";
import {
  InputField,
  SelectField,
  Text,
  Button,
  Tooltip,
} from "complexes-next-components";
import useForm from "./use-form";
import { route } from "@/app/_domain/constants/routes";
import { IoCamera, IoImages } from "react-icons/io5";

import Image from "next/image";
import { useCountryCityOptions } from "../register-option";
import DatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";
import "react-datepicker/dist/react-datepicker.css";
import { TbLivePhotoFilled } from "react-icons/tb";
import { GiReturnArrow } from "react-icons/gi";

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

  return (
    <div className="border-2 p-5 rounded-md mt-3 w-full">
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
                inputSize="full"
                rounded="md"
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
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("lastName")}
                tKeyError={t("apellidoadminRequerido")}
                hasError={!!errors.lastName}
                errorMessage={errors.lastName?.message}
              />

              <div className="flex gap-2 mt-2">
                <InputField
                  tKeyHelpText={t("docuemtno")}
                  tKeyPlaceholder={t("docuemtno")}
                  placeholder="Documento de identidad(cedula-pasaporte)"
                  helpText="Documento de identidad(cedula-pasaporte)"
                  sizeHelp="sm"
                  inputSize="full"
                  rounded="md"
                  type="text"
                  {...register("numberid")}
                  tKeyError={t("documentoRequerido")}
                  hasError={!!errors.numberid}
                  errorMessage={errors.numberid?.message}
                />
                <DatePicker
                  selected={birthDate}
                  onChange={(date) => {
                    setBirthDate(date);
                    register("bornDate");
                    setValue("bornDate", String(date), {
                      shouldValidate: true,
                    });
                  }}
                  placeholderText={t("nacimiento")}
                  dateFormat="yyyy-MM-dd"
                  className="w-full"
                  isClearable
                  customInput={
                    <InputField
                      placeholder={t("nacimiento")}
                      helpText={t("nacimiento")}
                      sizeHelp="sm"
                      inputSize="full"
                      rounded="md"
                      tKeyError={t("nacimientoRequerido")}
                      hasError={!!errors.bornDate}
                      errorMessage={errors.bornDate?.message}
                    />
                  }
                />
              </div>

              <div className="mt-2">
                <SelectField
                  searchable
                  tKeyHelpText={t("seleccionpais")}
                  tKeyDefaultOption={t("seleccionpais")}
                  defaultOption="Pais"
                  helpText="Pais"
                  sizeHelp="sm"
                  id="country"
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
                  tKeyError={t("paisRequerido")}
                  hasError={!!errors.country}
                  errorMessage={errors.country?.message}
                />
              </div>

              <div className="mt-2">
                <SelectField
                  searchable
                  tKeyHelpText={t("seleccionaciudad")}
                  tKeyDefaultOption={t("seleccionaciudad")}
                  defaultOption="Ciudad"
                  helpText="Ciudad"
                  id="city"
                  sizeHelp="sm"
                  options={cityOptions}
                  inputSize="lg"
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
              <div className="flex items-center gap-3 mt-2">
                <SelectField
                  tKeyDefaultOption={t("indicativo")}
                  tKeyHelpText={t("indicativo")}
                  searchable
                  defaultOption="Indicativo"
                  helpText="Indicativo"
                  sizeHelp="sm"
                  id="indicative"
                  options={indicativeOptions}
                  inputSize="lg"
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
                  sizeHelp="sm"
                  inputSize="full"
                  rounded="md"
                  type="text"
                  {...register("phone")}
                  tKeyError={t("celularRequerido")}
                  hasError={!!errors.phone}
                  errorMessage={errors.phone?.message}
                />
              </div>
              <InputField
                tKeyHelpText={t("correo")}
                tKeyPlaceholder={t("correo")}
                placeholder="Correo electronico"
                helpText="Correo electronico"
                sizeHelp="sm"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="email"
                {...register("email")}
                tKeyError={t("correoSolicitado")}
                hasError={!!errors.email}
                errorMessage={errors.email?.message}
              />
              <div className="flex items-center mt-3 gap-2">
                <input
                  type="checkbox"
                  {...register("termsConditions")}
                  className="w-6 h-6 accent-cyan-800 cursor-pointer"
                />
                <button
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
                </button>
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
                      size={400}
                      onClick={handleIconClick}
                      className="cursor-pointer text-gray-100"
                    />
                    <Button
                      size="sm"
                      type="button"
                      colVariant="warning"
                      className="flex gap-4 items-center"
                      onClick={openCamera}
                    >
                      <IoCamera className="mr-1" size={30} />
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
            <Text>Registrarse</Text>
          </Button>
        </form>
      </div>
    </div>
  );
}
