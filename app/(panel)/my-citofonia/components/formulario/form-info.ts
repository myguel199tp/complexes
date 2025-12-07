// useFormInfo.ts
import { useTranslation } from "react-i18next";
import RegisterOptions from "@/app/(panel)/my-new-immovable/_components/property/_components/regsiter-options";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { allUserListService } from "@/app/components/ui/citofonie-message/services/userlistSerive";
import { useEffect, useMemo, useRef, useState } from "react";

export default function useFormInfo(setValue: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { t } = useTranslation();
  const { visitOptions } = RegisterOptions();

  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";
  const [data, setData] = useState<EnsembleResponse[]>([]);
  const [filterText, setFilterText] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    allUserListService(infoConjunto)
      .then(setData)
      .catch((e) => console.error("Error users:", e));
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

  const handleGalleryClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file);
      setPreview(URL.createObjectURL(file));
    }
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
    ctx!.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    const imageData = canvasRef.current.toDataURL("image/png");
    setPreview(imageData);

    fetch(imageData)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], "foto.png", { type: "image/png" });
        setValue("file", file);
      });

    setIsCameraOpen(false);

    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
  };

  const handleSelectUser = (u: any) => {
    setSelectedUserId(u.value);
    setValue("apartment", u.apto);
  };

  return {
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
  };
}
