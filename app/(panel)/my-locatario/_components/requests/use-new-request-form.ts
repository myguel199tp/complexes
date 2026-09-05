"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { InferType, object, string } from "yup";
import { useState } from "react";

import { useCreateContractRequest } from "./requests-mutations";

const MAX_FILES = 6;
const MAX_FILE_SIZE = 8_000_000;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const schema = object({
  type: string()
    .oneOf(["DAMAGE", "MAINTENANCE", "CLAIM", "ADMINISTRATIVE", "OTHER"])
    .required("Selecciona el tipo"),
  title: string()
    .min(5, "El título es muy corto")
    .max(160, "Máximo 160 caracteres")
    .required("Título requerido"),
  description: string()
    // El mínimo lo exige también el backend: un reporte de dos palabras no le
    // sirve ni al propietario ni a la aseguradora para dimensionar el daño.
    .min(20, "Cuenta qué pasó, desde cuándo y en qué parte del inmueble")
    .required("Descripción requerida"),
  category: string().optional(),
  location: string().optional(),
  priority: string()
    .oneOf(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .required("Selecciona la prioridad"),
});

export type NewRequestValues = InferType<typeof schema>;

export function useNewRequestForm(onDone: () => void) {
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const mutation = useCreateContractRequest(() => {
    reset();
    setFiles([]);
    onDone();
  });

  const methods = useFormHook<NewRequestValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      type: "DAMAGE",
      priority: "MEDIUM",
    },
  });

  const { handleSubmit, reset, formState } = methods;

  const addFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return;

    const selected = Array.from(incoming);

    const tooBig = selected.find((file) => file.size > MAX_FILE_SIZE);
    if (tooBig) {
      setFileError(`"${tooBig.name}" supera los 8 MB`);
      return;
    }

    const wrongType = selected.find((file) => !ALLOWED.includes(file.type));
    if (wrongType) {
      setFileError("Solo se permiten imágenes o PDF");
      return;
    }

    if (files.length + selected.length > MAX_FILES) {
      setFileError(`Máximo ${MAX_FILES} evidencias`);
      return;
    }

    setFileError(null);
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();

    formData.append("type", data.type);
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("priority", data.priority);

    if (data.category) formData.append("category", data.category);
    if (data.location) formData.append("location", data.location);

    files.forEach((file) => formData.append("files", file));

    await mutation.mutateAsync(formData);
  });

  return {
    ...methods,
    errors: formState.errors,
    onSubmit,
    files,
    addFiles,
    removeFile,
    fileError,
    isSubmitting: mutation.isPending,
  };
}
