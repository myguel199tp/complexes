import { useRef, useState } from "react";

export default function useAddFormInfo() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return { previews, setPreviews, handleIconClick, fileInputRef };
}
