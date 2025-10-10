import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function MyactivityForminfo() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

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
    t,
  };
}
