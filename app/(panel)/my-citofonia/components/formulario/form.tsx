"use client";
import {
  InputField,
  Text,
  Button,
  SelectField,
} from "complexes-next-components";
import React, { useRef, useState } from "react";
import { IoCamera, IoImages } from "react-icons/io5";
import useForm from "./use-form";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import RegisterOptions from "@/app/(panel)/my-new-immovable/_components/property/_components/regsiter-options";
import { TbLivePhotoFilled } from "react-icons/tb";

export default function Form() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { visitOptions } = RegisterOptions();
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const { t } = useTranslation();
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    isSuccess,
  } = useForm();

  const handleGalleryClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    }
  };

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full p-6"
      >
        <section className="w-full flex flex-col md:!flex-row my-8">
          <div className="w-full md:!w-[70%]">
            <SelectField
              className="mt-2"
              helpText={t("tipoVisitante")}
              sizeHelp="sm"
              defaultOption={t("tipoVisitante")}
              options={visitOptions}
              inputSize="lg"
              rounded="md"
              {...register("visitType")}
              hasError={!!errors.visitType}
              errorMessage={errors.visitType?.message}
            />
            <InputField
              placeholder={t("nombreVisitante")}
              helpText={t("nombreVisitante")}
              className="mt-2"
              sizeHelp="sm"
              {...register("namevisit")}
              hasError={!!errors.namevisit}
              errorMessage={errors.namevisit?.message}
            />
            <InputField
              placeholder={t("nuemroIdentificacion")}
              helpText={t("nuemroIdentificacion")}
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("numberId")}
              hasError={!!errors.numberId}
              errorMessage={errors.numberId?.message}
            />
            <InputField type="hidden" {...register("nameUnit")} />

            <InputField
              placeholder={t("numeroInmuebleResidencial")}
              helpText={t("numeroInmuebleResidencial")}
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("apartment")}
              hasError={!!errors.apartment}
              errorMessage={errors.apartment?.message}
            />
            <InputField
              placeholder={t("numeroPlaca")}
              helpText={t("numeroPlaca")}
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("plaque")}
              hasError={!!errors.plaque}
              errorMessage={errors.plaque?.message}
            />
          </div>

          <div className="w-full md:!w-[30%] mt-2 ml-2 flex flex-col justify-center items-center border-x-4 p-2">
            {!preview && !isCameraOpen && (
              <div className="flex flex-col items-center gap-2">
                <IoImages
                  size={200}
                  onClick={handleGalleryClick}
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
                <video ref={videoRef} className="w-80 border rounded-md" />

                <TbLivePhotoFilled
                  onClick={takePhoto}
                  className="mt-4 cursor-pointer text-cyan-800 hover:text-gray-200"
                  size={45}
                />
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
                  width={600}
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

        <Button
          colVariant="warning"
          tKey={t("registrarVisitante")}
          translate="yes"
          size="full"
          rounded="lg"
          type="submit"
          className="mt-4"
          disabled={isSuccess}
        >
          Registrar Visitante
        </Button>
      </form>
    </div>
  );
}
