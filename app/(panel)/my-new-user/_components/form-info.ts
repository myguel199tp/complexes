import { useRef, useState } from "react";
import useForm from "./use-form";
import { useFieldArray } from "react-hook-form";
import { useCountryCityOptions } from "@/app/(dashboard)/registers/_components/register-option";
import { useTranslation } from "react-i18next";

export function useForminfo() {
  const [selectedRol, setSelectedRol] = useState("");
  const [selectedplaque, setSelectedPlaque] = useState("");
  const [selectedNumberId, setSelectedNumberId] = useState("");
  const [selectedApartment, setSelectedApartment] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedMainResidence, setSelectedMainResidence] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    handleIconClick,
    fileInputRef,
    control,
  } = useForm({
    role: selectedRol,
    apartment: selectedApartment,
    plaque: selectedplaque,
    numberid: selectedNumberId,
    tower: selectedBlock,
    isMainResidence: selectedMainResidence,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "population",
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    countryOptions,
    cityOptions,
    indicativeOptions,
    setSelectedCountryId,
  } = useCountryCityOptions();

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

  const [birthDate, setBirthDate] = useState<Date | null>(null);

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

  const { t } = useTranslation();

  return {
    register,
    setValue,
    errors,
    handleSubmit,
    handleIconClick,
    fileInputRef,
    control,
    fields,
    append,
    remove,
    videoRef,
    canvasRef,
    optionsRol: [
      { value: "owner", label: "Dueño de apartamento" },
      { value: "employee", label: "Portero" },
    ],
    countryOptions,
    cityOptions,
    indicativeOptions,
    setSelectedCountryId,
    openCamera,
    takePhoto,
    birthDate,
    setBirthDate,
    handleFileChange,
    selectedRol,
    setSelectedRol,
    selectedplaque,
    setSelectedPlaque,
    selectedNumberId,
    setSelectedNumberId,
    selectedApartment,
    setSelectedApartment,
    selectedBlock,
    setSelectedBlock,
    selectedMainResidence,
    setSelectedMainResidence,
    preview,
    isCameraOpen,
    t,
  };
}
