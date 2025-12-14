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

export function useForminfo() {
  const router = useRouter();
  const [formState, setFormState] = useState({
    selectedPlaque: "",
    selectedNumberId: "",
    selectedApartment: "",
    selectedBlock: "",
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
    isMainResidence: formState.selectedMainResidence,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "familyInfo",
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
  const { language } = useLanguage();
  return {
    t,
    language,
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
