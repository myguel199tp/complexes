import { useTranslation } from "react-i18next";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { allUserListService } from "@/app/components/ui/citofonie-message/services/userlistSerive";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useVisitOptions } from "./options-visit";

export default function useFormInfo(setValue: any) {
  /* ---------------- REFS ---------------- */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ---------------- I18N ---------------- */
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { visitOptions } = useVisitOptions();

  /* ---------------- STATE ---------------- */
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [data, setData] = useState<EnsembleResponse[]>([]);

  /* ---------------- STORE ---------------- */
  const { conjuntoId } = useConjuntoStore();

  /* ---------------- EFFECTS ---------------- */

  // 🔹 Cargar usuarios
  useEffect(() => {
    if (!conjuntoId) return;

    allUserListService(conjuntoId).then(setData).catch(console.error);
  }, [conjuntoId]);

  // 🔹 Cerrar cámara al cambiar idioma (evita bugs visuales)
  useEffect(() => {
    setIsCameraOpen(false);
  }, [language]);

  // 🔹 Cleanup: apagar cámara al desmontar el componente
  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* ---------------- MEMOS ---------------- */

  const ListUser = useMemo(
    () =>
      data
        .filter((u) => !(u.role === "owner" && !u.isMainResidence))
        .map((u) => ({
          value: u.user.id,
          label: u.user?.name ?? "Sin nombre",
          apto: u.apartment,
          imgapt: u.user.file,
        })),
    [data],
  );

  /* ---------------- CONSTANTS ---------------- */

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  /* ---------------- HANDLERS ---------------- */

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValue("file", file, { shouldValidate: true });
    setPreview(URL.createObjectURL(file));
  };

  const openCamera = async () => {
    setIsCameraOpen(true);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

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

      const file = new File([blob], "foto.png", { type: "image/png" });
      setValue("file", file, { shouldValidate: true });
      setPreview(URL.createObjectURL(blob));
    });

    const stream = videoRef.current.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());

    setIsCameraOpen(false);
  };

  const handleSelectUser = (u: any) => {
    setSelectedUserId(u.value);
    setValue("apartment", u.apto, { shouldValidate: true });
  };

  /* ---------------- RETURN ---------------- */

  return {
    t,
    language,
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
    setIsCameraOpen,
  };
}
