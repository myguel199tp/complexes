import { useLanguage } from "@/app/hooks/useLanguage";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function useFormInfo() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { t } = useTranslation();
  const { language } = useLanguage();

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return {
    fileInputRef,
    preview,
    setPreview,
    handleIconClick,
    t,
    language,
  };
}
