"use client";

import React, { useRef } from "react";
import { Avatar } from "complexes-next-components";
import { FaCameraRetro } from "react-icons/fa6";
import { ImSpinner9 } from "react-icons/im";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { fileUrl } from "@/app/helpers/fileUrl";
import { useUpdateConjuntoImageMutation } from "./use-update-conjunto-image-mutation";

// Los mismos que acepta el backend.
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

interface Props {
  file: string;
  /** Solo la administración del conjunto (rol employee) la cambia. */
  canEdit: boolean;
}

export default function ConjuntoImage({ file, canEdit }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const showAlert = useAlertStore((state) => state.showAlert);
  const updateImage = useUpdateConjuntoImageMutation();

  const avatar = (
    <Avatar
      src={fileUrl(file)}
      alt="avatar conjunto"
      size="xl"
      border="none"
      shape="rounded"
    />
  );

  if (!canEdit) return avatar;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];

    // Sin limpiarlo, volver a elegir la misma imagen no dispara el cambio.
    e.target.value = "";

    if (!selected) return;

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      showAlert("La imagen debe ser JPG, PNG o WebP", "error");
      return;
    }

    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      showAlert(`La imagen no puede pesar más de ${MAX_SIZE_MB} MB`, "error");
      return;
    }

    updateImage.mutate(selected);
  };

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div className="relative">
        {avatar}

        {updateImage.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-white/70">
            <ImSpinner9 className="animate-spin text-cyan-800" size={24} />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={updateImage.isLoading}
        className="flex items-center gap-1 text-xs font-medium text-cyan-700 transition-colors hover:text-cyan-900 disabled:opacity-50"
      >
        <FaCameraRetro size={13} />
        Cambiar imagen
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
