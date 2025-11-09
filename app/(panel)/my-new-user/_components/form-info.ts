import { useRef, useState } from "react";
import useForm from "./use-form";
import { useFieldArray } from "react-hook-form";
import { useCountryCityOptions } from "@/app/(dashboard)/registers/_components/register-option";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

export function useForminfo() {
  const router = useRouter();
  const [formState, setFormState] = useState({
    selectedRol: "",
    selectedPlaque: "",
    selectedNumberId: "",
    selectedApartment: "",
    selectedBlock: "",
    tipoVehiculo: "",
    deposito: false,
    parqueadero: "",
    selectedMainResidence: false,
    preview: null as string | null,
    isCameraOpen: false,
    birthDate: null as Date | null,
  });
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
    role: formState.selectedRol,
    apartment: formState.selectedApartment,
    plaque: formState.selectedPlaque,
    numberid: formState.selectedNumberId,
    tower: formState.selectedBlock,
    isMainResidence: formState.selectedMainResidence,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "familyInfo",
  });

  const {
    fields: vehicleFields,
    append: appendVehicle,
    remove: removeVehicle,
  } = useFieldArray({
    control,
    name: "vehicles",
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

        setFormState((prev) => ({ ...prev, preview: imageData }));
        setFormState((prev) => ({ ...prev, isCameraOpen: false }));

        // detener la cámara
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
      const fileUrl = URL.createObjectURL(file);
      setFormState((prev) => ({ ...prev, preview: fileUrl }));
    } else {
      setFormState((prev) => ({ ...prev, preview: null }));
    }
  };
  const { t } = useTranslation();

  return {
    t,
    handleFileChange,
    takePhoto,
    setFormState,
    openCamera,
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
    register,
    router,
    control,
    videoRef,
    canvasRef,
    watch,
    vehicleFields,
    appendVehicle,
    removeVehicle,
  };
}
