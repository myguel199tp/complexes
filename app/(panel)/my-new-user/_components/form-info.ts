import { useRef, useState } from "react";
import useForm from "./use-form";
import { useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";
import {
  ParkingType,
  vehicless,
  VehicleType,
} from "@/app/(sets)/registers/_components/use-mutation-form";
import { useLanguage } from "@/app/hooks/useLanguage";
import { detectFace } from "@/app/helpers/faceDetection";

export function useForminfo() {
  const router = useRouter();

  const [formState, setFormState] = useState({
    selectedPlaque: "",
    selectedNumberId: "",
    selectedApartment: "",
    selectedBlock: "",
    selectCoeficient: 1,
    deposito: false,
    parqueadero: "",
    selectedMainResidence: false,
    preview: null as string | null,
    isCameraOpen: false,
    birthDate: null as Date | null,
  });

  const [tipoVehiculo, setTipoVehiculo] = useState<vehicless[]>([]);

  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    handleIconClick,
    fileInputRef,
    control,
    watch,
  } = useForm({
    apartment: formState.selectedApartment,
    vehicles: tipoVehiculo,
    plaque: formState.selectedPlaque,
    numberId: formState.selectedNumberId,
    tower: formState.selectedBlock,
    coeficiente: formState.selectCoeficient,
    isMainResidence: formState.selectedMainResidence,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "familyInfo",
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    countryOptions,
    cityOptions,
    indicativeOptions,
    setSelectedCountryId,
  } = useCountryCityOptions();

  // 🔴 FIX IMPORTANTE: imagen estable + MediaPipe correcto
  const processImage = async (file: File) => {
    const fileUrl = URL.createObjectURL(file);

    const img = new Image();
    img.src = fileUrl;

    // ✔ más estable que onload
    await img.decode();

    try {
      const hasFace = await detectFace(img);

      console.log("FACE DETECTION RESULT:", hasFace);

      if (!hasFace) {
        alert("Debes usar una imagen donde se vea una persona");
        return false;
      }

      setValue("file", file, { shouldValidate: true });

      setFormState((prev) => ({
        ...prev,
        preview: fileUrl,
      }));

      return true;
    } catch (err) {
      console.error("Error detectando rostro:", err);
      return false;
    }
  };

  const openCamera = async () => {
    setFormState((prev) => ({ ...prev, isCameraOpen: true }));

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

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );

    const imageData = canvasRef.current.toDataURL("image/jpeg", 0.95);

    const blob = await fetch(imageData).then((r) => r.blob());
    const file = new File([blob], "foto.jpg", { type: "image/jpeg" });

    const ok = await processImage(file);

    if (!ok) return;

    setFormState((prev) => ({
      ...prev,
      preview: imageData,
      isCameraOpen: false,
    }));

    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setFormState((prev) => ({ ...prev, preview: null }));
      return;
    }

    await processImage(file);
  };

  const handleAddVehicle = () => {
    setTipoVehiculo((prev) => [
      ...prev,
      {
        type: VehicleType.CAR,
        parkingType: ParkingType.PUBLIC,
        assignmentNumber: "",
        plaque: "",
      },
    ]);
  };

  const handleRemoveVehicle = (index: number) => {
    setTipoVehiculo((prev) => prev.filter((_, i) => i !== index));
  };

  const { t } = useTranslation();
  const { language } = useLanguage();

  return {
    t,
    language,
    handleFileChange,
    takePhoto,
    openCamera,
    setFormState,
    setValue,
    countryOptions,
    cityOptions,
    indicativeOptions,
    setSelectedCountryId,
    fields,
    append,
    remove,
    handleSubmit,
    handleIconClick,
    fileInputRef,
    errors,
    formState,
    setTipoVehiculo,
    register,
    router,
    control,
    videoRef,
    canvasRef,
    watch,
    tipoVehiculo,
    handleAddVehicle,
    handleRemoveVehicle,
  };
}
