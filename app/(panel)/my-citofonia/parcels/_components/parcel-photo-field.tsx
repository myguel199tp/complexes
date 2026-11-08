"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Text, Tooltip } from "complexes-next-components";
import { IoCamera, IoImages, IoReturnDownBackOutline } from "react-icons/io5";
import { TbLivePhotoFilled } from "react-icons/tb";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const JPEG_QUALITY = 0.85;

interface Props {
  photo: File | null;
  onChange: (photo: File | null) => void;
  onError: (message: string | null) => void;
}

const stop = (stream: MediaStream | null) =>
  stream?.getTracks().forEach((track) => track.stop());

/**
 * La foto suele ser de la etiqueta: se pide la cámara trasera y se captura a la
 * resolución real del video para que la guía y el nombre se puedan leer.
 */
export default function ParcelPhotoField({ photo, onChange, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(false);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      // El modal desmonta su contenido al cerrar; sin esto la cámara sigue encendida.
      stop(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(photo);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [photo]);

  // El <video> solo existe después de abrir la cámara.
  useEffect(() => {
    const video = videoRef.current;
    if (!cameraOpen || !video) return;

    video.srcObject = streamRef.current;
    void video.play().catch(() => undefined);
  }, [cameraOpen]);

  const closeCamera = () => {
    stop(streamRef.current);
    streamRef.current = null;
    setCameraOpen(false);
  };

  const openCamera = async () => {
    onError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      // Pudieron cerrar el modal mientras el navegador pedía el permiso.
      if (!mountedRef.current) {
        stop(stream);
        return;
      }

      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      onError(
        "No se pudo abrir la cámara. Revisa el permiso del navegador o sube la foto desde un archivo.",
      );
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        onChange(
          new File([blob], `paquete-${Date.now()}.jpg`, { type: "image/jpeg" }),
        );
      },
      "image/jpeg",
      JPEG_QUALITY,
    );

    closeCamera();
  };

  const chooseFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Sin esto, escoger de nuevo el mismo archivo no dispara `change`.
    event.target.value = "";

    if (!file) return;

    if (file.size > MAX_PHOTO_BYTES) {
      onError("La foto pesa más de 5 MB");
      return;
    }

    onError(null);
    onChange(file);
  };

  const pickFile = () => fileInputRef.current?.click();

  return (
    <div className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 transition hover:border-cyan-500">
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/png, image/jpeg"
        onChange={chooseFile}
      />

      {cameraOpen && (
        <div className="flex w-full flex-col items-center">
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full rounded-md border"
          />

          <div className="mt-4 flex gap-10">
            <button type="button" aria-label="Capturar foto" onClick={capture}>
              <TbLivePhotoFilled size={40} className="text-cyan-600" />
            </button>
            <button
              type="button"
              aria-label="Cerrar la cámara"
              onClick={closeCamera}
            >
              <IoReturnDownBackOutline size={35} className="text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {!cameraOpen && preview && (
        <div className="flex w-full flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Foto del paquete"
            className="max-h-72 w-full rounded-xl border border-gray-200 object-contain shadow-md"
          />

          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" size="sm" onClick={openCamera}>
              Tomar otra
            </Button>
            <Button type="button" size="sm" onClick={pickFile}>
              Cambiar
            </Button>
            <Button
              type="button"
              size="sm"
              colVariant="warning"
              onClick={() => onChange(null)}
            >
              Quitar
            </Button>
          </div>
        </div>
      )}

      {!cameraOpen && !preview && (
        <div className="flex flex-col items-center gap-3 text-center">
          <button type="button" aria-label="Elegir archivo" onClick={pickFile}>
            <IoImages className="h-24 w-24 text-gray-400 transition hover:text-cyan-600" />
          </button>

          <Text size="md" className="text-slate-900">
            Foto del paquete
          </Text>
          <Text size="sm" colVariant="primary">
            Opcional · PNG o JPG
          </Text>

          <Tooltip content="Tomar foto" className="bg-gray-200">
            <Button
              type="button"
              colVariant="success"
              size="sm"
              aria-label="Tomar foto"
              onClick={openCamera}
            >
              <IoCamera size={20} />
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
