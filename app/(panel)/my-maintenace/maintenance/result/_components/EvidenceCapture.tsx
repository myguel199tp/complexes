/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "complexes-next-components";
import { FiCamera, FiRefreshCw, FiTrash2, FiUpload } from "react-icons/fi";

/**
 * Captura de evidencia del mantenimiento.
 *
 * Antes se pedía una "URL de evidencia" escrita a mano, algo que nadie tiene
 * parado frente al equipo que acaba de arreglar. Aquí se toma la foto con la
 * cámara del propio dispositivo (getUserMedia en escritorio, la cámara del
 * teléfono en móvil) o se adjunta una foto/video ya grabado.
 */

const MAX_SIZE_MB = 25;

interface Props {
  value: File | null;
  onChange: (file: File | null) => void;
  errorMessage?: string;
}

export default function EvidenceCapture({
  value,
  onChange,
  errorMessage,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // La preview se libera al cambiar de archivo: un objectURL vivo retiene el
  // blob completo en memoria.
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [value]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraOpen(false);
  }, []);

  // Apagar la cámara al desmontar evita dejar el led encendido si el modal se
  // cierra con la vista previa abierta.
  useEffect(() => stopCamera, [stopCamera]);

  const openCamera = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Este navegador no permite abrir la cámara. Adjunta la foto desde el dispositivo.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // En el celular la trasera es la que apunta al equipo; en escritorio se
        // ignora y se usa la única disponible.
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraOpen(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError(
        "No se pudo acceder a la cámara. Revisa los permisos o adjunta la foto desde el dispositivo.",
      );
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        onChange(
          new File([blob], `evidencia-${Date.now()}.jpg`, {
            type: "image/jpeg",
          }),
        );
        stopCamera();
      },
      "image/jpeg",
      0.85,
    );
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setCameraError(`El archivo supera los ${MAX_SIZE_MB}MB permitidos.`);
      return;
    }

    setCameraError(null);
    onChange(file);
  };

  const isVideo = value?.type.startsWith("video/");

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">
        Evidencia (foto o video)
      </p>

      {isCameraOpen ? (
        <div className="space-y-2">
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-56 w-full rounded-xl bg-black object-cover"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              colVariant="success"
              size="sm"
              onClick={takePhoto}
            >
              <span className="flex items-center gap-2">
                <FiCamera /> Capturar
              </span>
            </Button>
            <Button
              type="button"
              colVariant="default"
              size="sm"
              onClick={stopCamera}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : value && previewUrl ? (
        <div className="space-y-2">
          {isVideo ? (
            <video
              src={previewUrl}
              controls
              className="h-56 w-full rounded-xl bg-black object-cover"
            />
          ) : (
            <img
              src={previewUrl}
              alt="Evidencia del mantenimiento"
              className="h-56 w-full rounded-xl object-cover"
            />
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              colVariant="default"
              size="sm"
              onClick={() => {
                onChange(null);
                void openCamera();
              }}
            >
              <span className="flex items-center gap-2">
                <FiRefreshCw /> Repetir
              </span>
            </Button>
            <Button
              type="button"
              colVariant="danger"
              size="sm"
              onClick={() => onChange(null)}
            >
              <span className="flex items-center gap-2">
                <FiTrash2 /> Quitar
              </span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            colVariant="primary"
            size="sm"
            onClick={openCamera}
          >
            <span className="flex items-center gap-2">
              <FiCamera /> Tomar foto
            </span>
          </Button>
          <Button
            type="button"
            colVariant="default"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="flex items-center gap-2">
              <FiUpload /> Adjuntar foto o video
            </span>
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      {(cameraError || errorMessage) && (
        <p className="text-xs text-red-600">{cameraError ?? errorMessage}</p>
      )}
    </div>
  );
}
