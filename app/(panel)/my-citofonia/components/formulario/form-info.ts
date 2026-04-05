/* eslint-disable react-hooks/exhaustive-deps */
import { useTranslation } from "react-i18next";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { allUserListService } from "@/app/components/ui/citofonie-message/services/userlistSerive";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/hooks/useLanguage";
import { UseFormSetValue } from "react-hook-form";

import type { FormValues } from "./use-form";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { VisitType } from "./constants";

type UserOption = {
  value: string;
  label: string;
  apto: string;
  imgapt?: string | null;
};

export default function useFormInfo(setValue: UseFormSetValue<FormValues>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { t } = useTranslation();
  const { language } = useLanguage();

  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [data, setData] = useState<EnsembleResponse[]>([]);

  const { conjuntoId } = useConjuntoStore();

  useEffect(() => {
    if (!conjuntoId) return;

    allUserListService(conjuntoId).then(setData).catch(console.error);
  }, [conjuntoId]);

  useEffect(() => {
    setIsCameraOpen(false);
  }, [language]);

  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const ListUser = useMemo(
    () =>
      data
        ?.filter((u) => !(u.role === "owner" && !u.isMainResidence))
        .map((u) => ({
          value: u.user.id,
          label: u.user?.name ?? "Sin nombre",
          apto: u.apartment,
          imgapt: u.user.file,
        })),
    [data],
  );

  const showAlert = useAlertStore((state) => state.showAlert);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setPreview(null);
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg"];

    if (!allowedTypes.includes(file.type)) {
      showAlert("Solo se permiten archivos PNG o JPG", "error");
      e.target.value = ""; // limpia el input
      setPreview(null);
      return;
    }

    setValue("file", file, { shouldValidate: true });

    const fileUrl = URL.createObjectURL(file);
    setPreview(fileUrl);
  };

  const openCamera = async () => {
    setIsCameraOpen(true);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, 300, 200);

    canvasRef.current.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], "foto.png", {
        type: "image/png",
      });

      setValue("file", file, { shouldValidate: true });
      setPreview(URL.createObjectURL(blob));
    });

    const stream = videoRef.current.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());

    setIsCameraOpen(false);
  };

  const handleSelectUser = (u: UserOption) => {
    setSelectedUserId(u.value);

    setValue("apartment", u.apto, {
      shouldValidate: true,
    });
  };

  const visitOptions = [
    { label: "Residente", value: VisitType.RESIDENT },
    { label: "Familiar", value: VisitType.FAMILY },
    { label: "Amigo", value: VisitType.FRIEND },
    { label: "Repartidor", value: VisitType.DELIVERY },
    { label: "Mensajería", value: VisitType.MAIL },
    { label: "Servicio técnico", value: VisitType.SERVICE },
    { label: "Mantenimiento", value: VisitType.MAINTENANCE },
    { label: "Empleado doméstico", value: VisitType.DOMESTIC_WORKER },
    { label: "Conductor", value: VisitType.DRIVER },
    { label: "Visitante", value: VisitType.VISITOR },
    { label: "Contratista", value: VisitType.CONTRACTOR },
    { label: "Inmobiliaria", value: VisitType.REAL_ESTATE },
    { label: "Seguridad", value: VisitType.SECURITY },
    { label: "Administración", value: VisitType.ADMIN },
    { label: "Emergencia", value: VisitType.EMERGENCY },
  ];

  return {
    t,
    language,
    preview,
    isCameraOpen,
    fileInputRef,
    videoRef,
    canvasRef,
    BASE_URL,
    visitOptions,
    ListUser,
    filterText,
    selectedUserId,
    setFilterText,
    handleGalleryClick,
    handleFileChange,
    openCamera,
    takePhoto,
    handleSelectUser,
    setIsCameraOpen,
  };
}
