"use client";
import {
  InputField,
  Text,
  Button,
  SelectField,
  Avatar,
} from "complexes-next-components";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { IoCamera, IoImages } from "react-icons/io5";
import useForm from "./use-form";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import RegisterOptions from "@/app/(panel)/my-new-immovable/_components/property/_components/regsiter-options";
import { TbLivePhotoFilled } from "react-icons/tb";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { allUserListService } from "@/app/components/ui/citofonie-message/services/userlistSerive";

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

        fetch(imageData)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "foto.png", { type: "image/png" });
            setValue("file", file, { shouldValidate: true });
          });

        setPreview(imageData);
        setIsCameraOpen(false);

        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";
  const [data, setData] = useState<EnsembleResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  console.log(error);
  useEffect(() => {
    allUserListService(infoConjunto)
      .then(setData)
      .catch((err: unknown) => {
        console.error("Error al obtener usuarios:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      });
  }, [infoConjunto]);

  const ListUser = useMemo(() => {
    return data
      .filter((u) => !(u.role === "owner" && u.isMainResidence === false))
      .map((u) => ({
        value: u.user.id,
        label: u.user?.name ?? "Sin nombre",
        apto: u.apartment,
        imgapt: u.user.file,
      }));
  }, [data]);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const handleSelectUser = (u: any) => {
    setSelectedUserId(u.value);
    setValue("apartment", u.apto, { shouldValidate: true });
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full p-6"
      >
        <section className="w-full flex flex-col gap-4 md:!flex-row my-8">
          <div className="w-full md:!w-[20%] overflow-y-auto">
            <InputField
              placeholder="Buscar residente o inmueble"
              inputSize="full"
              rounded="md"
              className="mt-3"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <ul className="space-y-2 mt-2">
              {ListUser.filter((u) =>
                `${u.label} ${u.apto}`
                  .toLowerCase()
                  .includes(filterText.toLowerCase())
              ).map((u) => (
                <li key={u.value}>
                  <button
                    type="button"
                    onClick={() => handleSelectUser(u)}
                    className={`relative w-full text-left px-3 py-2 rounded-md transition ${
                      selectedUserId === u.value
                        ? "bg-cyan-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex gap-4 items-center">
                      <Avatar
                        src={`${BASE_URL}/uploads/${u.imgapt.replace(
                          /^.*[\\/]/,
                          ""
                        )}`}
                        alt={`${u.label}`}
                        size="md"
                        border="thick"
                        shape="round"
                      />
                      <div>
                        <Text size="sm">{u.label}</Text>
                        {u.apto && (
                          <Text size="sm" font="bold">
                            Inmueble: {u.apto}
                          </Text>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:!w-[40%] mt-4">
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

            {/* Campo oculto donde se guarda el apartamento seleccionado */}
            <InputField type="hidden" {...register("apartment")} />

            {/* Buscador y listado de apartamentos */}

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

          {/* Sección derecha (foto) */}
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
