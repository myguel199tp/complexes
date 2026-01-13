import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import useForm from "./use-form";

export default function MyactivityEditForminfo(id: string) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { t } = useTranslation();

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm(id);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

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

  const showAlert = useAlertStore((state) => state.showAlert);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  return {
    handleIconClick,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    preview,
    setPreview,
    fileInputRef,
    handleFileChange,
    register,
    setValue,
    handleSubmit,
    errors,
    showAlert,
    t,
  };
}
