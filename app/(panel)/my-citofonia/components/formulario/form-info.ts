import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import RegisterOptions from "@/app/(panel)/my-new-immovable/_components/property/_components/regsiter-options";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { allUserListService } from "@/app/components/ui/citofonie-message/services/userlistSerive";
import { useForm } from "react-hook-form";

export default function useFormInfo() {
  // 📸 Refs para cámara y archivos
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 📋 Configuración de formulario
  const { register, handleSubmit, formState, setValue } = useForm();
  const { errors } = formState;
  const { t } = useTranslation();
  const { visitOptions } = RegisterOptions();

  // 📸 Estado visual y control
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // 🧑‍🤝‍🧑 Estado y carga de usuarios
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";
  const [data, setData] = useState<EnsembleResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    allUserListService(infoConjunto)
      .then(setData)
      .catch((err: unknown) => {
        console.error("Error al obtener usuarios:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      });
  }, [infoConjunto]);

  // 🔍 Filtrado de usuarios
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

  // 🎞️ Cámara y galería
  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
      setPreview(URL.createObjectURL(file));
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

  // 🏘️ Selección de usuario
  const handleSelectUser = (u: any) => {
    setSelectedUserId(u.value);
    setValue("apartment", u.apto, { shouldValidate: true });
  };

  // 🧠 Devuelve todo lo que el componente necesita
  return {
    register,
    handleSubmit,
    errors,
    setValue,
    t,
    visitOptions,
    preview,
    isCameraOpen,
    fileInputRef,
    videoRef,
    canvasRef,
    handleGalleryClick,
    handleFileChange,
    openCamera,
    takePhoto,
    BASE_URL,
    ListUser,
    filterText,
    setFilterText,
    selectedUserId,
    handleSelectUser,
    error,
  };
}
