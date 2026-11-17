/* eslint-disable react-hooks/exhaustive-deps */
import { useTranslation } from "react-i18next";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  getVisitResidents,
  type HouseholdMember,
} from "@/app/(panel)/my-citofonia/services/visitResidentsService";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/hooks/useLanguage";
import { UseFormSetValue } from "react-hook-form";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { visitTypeOptions } from "./constants";
import { useQuery } from "@tanstack/react-query";

import type { FormValues } from "./use-form";

export type UserOption = {
  /** Id de la relación usuario–conjunto: único por fila. */
  id: string;
  label: string;
  roleLabel: string;
  apto: string;
  tower: string | null;
  imgapt?: string | null;
  family: HouseholdMember[];
};

const ROLE_LABEL: Record<string, string> = {
  owner: "Propietario",
  tenant: "Arrendatario",
  resident: "Residente",
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

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

  const { conjuntoId } = useConjuntoStore();
  const showAlert = useAlertStore((state) => state.showAlert);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  /**
   * Solo quienes viven en el conjunto —propietario residente, arrendatario,
   * residente— con sus familiares. Antes salía el listado general de
   * relaciones: porteros, colaboradores y propietarios que no viven ahí.
   */
  const {
    data: residents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["visit-residents", conjuntoId],
    queryFn: () => getVisitResidents(conjuntoId!),
    enabled: !!conjuntoId,
  });

  const ListUser = useMemo<UserOption[]>(
    () =>
      residents.map((r) => ({
        id: r.id,
        label: r.name ?? "Sin nombre",
        roleLabel: ROLE_LABEL[r.role] ?? "Residente",
        apto: r.apartment,
        tower: r.tower,
        imgapt: r.file,
        family: r.family,
      })),
    [residents],
  );

  /**
   * También busca por familiar: si la visita pregunta por la hija, el portero
   * escribe su nombre y le sale la unidad del papá.
   */
  const filteredUsers = useMemo(() => {
    const term = normalize(filterText.trim());
    if (!term) return ListUser;

    return ListUser.filter((u) =>
      normalize(
        [
          u.label,
          u.tower ? `torre ${u.tower}` : "",
          `apto ${u.apto}`,
          ...u.family.map((f) => f.name ?? ""),
        ].join(" "),
      ).includes(term),
    );
  }, [ListUser, filterText]);

  /** Familiares que coinciden con lo buscado, para resaltarlos. */
  const matchesFamily = (member: HouseholdMember) => {
    const term = normalize(filterText.trim());
    return !!term && normalize(member.name ?? "").includes(term);
  };

  // 🔥 RESET CAMERA ON LANGUAGE CHANGE
  useEffect(() => {
    setIsCameraOpen(false);
  }, [language]);

  // 🔥 CLEAN CAMERA STREAM
  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // 🔥 FILE GALLERY
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
      e.target.value = "";
      setPreview(null);
      return;
    }

    setValue("file", file, { shouldValidate: true });

    const fileUrl = URL.createObjectURL(file);
    setPreview(fileUrl);
  };

  // 🔥 CAMERA
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

  // 🔥 SELECT USER
  const handleSelectUser = (u: UserOption) => {
    // Por fila, no por usuario: si no, seleccionar a alguien con dos
    // residencias resaltaba ambas y no se sabía qué apartamento se eligió.
    setSelectedUserId(u.id);

    // Solo se envía el apartamento: el backend resuelve el residente contra la
    // relación usuario–conjunto, así que ya no depende de este select.
    setValue("apartment", u.apto, {
      shouldValidate: true,
    });
  };

  // La lista se comparte con el formulario de pases de acceso.
  const visitOptions = visitTypeOptions;

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
    filteredUsers,
    matchesFamily,
    filterText,
    selectedUserId,
    isLoading,
    error,
    setFilterText,
    handleGalleryClick,
    handleFileChange,
    openCamera,
    takePhoto,
    handleSelectUser,
    setIsCameraOpen,
  };
}
