"use client";

import { InferType, array, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { useMutationAddForm } from "./use-mutation-add-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  countryMap,
  phoneLengthByCountry,
} from "@/app/helpers/longitud-telefono";
import { useEffect } from "react";

const payload = getTokenPayload();

const schema = object({
  userId: string(),
  name: string().required("Este campo es requerido"),
  conjunto_id: string(),
  indicative: string().required("indicativo es requerido"),
  profession: string().required("Este campo es requerido"),
  webPage: string().optional(),
  instagramred: string().optional(),
  facebookred: string().optional(),
  tiktokred: string().optional(),
  youtubered: string().optional(),
  xred: string().optional(),
  email: string(),
  description: string().required("Este campo es requerido"),
  phone: string()
    .required("Teléfono es requerido")
    .matches(/^[0-9]+$/, "Solo se permiten números")
    .test(
      "len",
      "Longitud inválida para el país seleccionado",
      function (value) {
        const { indicative } = this.parent;
        if (!indicative || !value) return true;

        // Ejemplo: "+56-Chile"
        const countryName = indicative.split("-")[1]?.trim()?.toUpperCase();
        const countryCode = countryMap[countryName];
        const expectedLength = phoneLengthByCountry[countryCode ?? ""];

        if (!expectedLength) return true;
        return value.length === expectedLength;
      }
    ),
  files: array()
    .of(mixed<File>().required())
    .min(1, "Debes subir al menos una imagen")
    .test("fileSize", "Cada archivo debe ser menor a 5MB", (files = []) =>
      files.every((file) => file.size <= 5 * 1024 * 1024)
    )
    .test("fileType", "Solo se permiten archivos JPEG o PNG", (files = []) =>
      files.every((file) => ["image/jpeg", "image/png"].includes(file.type))
    )
    .required(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationAddForm();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const createdAt = new Date();
  const finishedAt = new Date(createdAt);
  finishedAt.setDate(finishedAt.getDate() + 20);
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      userId: String(storedUserId),
      conjunto_id: idConjunto || "",
      files: [],
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjunto_id", String(idConjunto));
    }
  }, [idConjunto, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();
    formData.append("userId", dataform.userId || "");
    formData.append("name", dataform.name);
    formData.append("conjunto_id", dataform.conjunto_id || "");
    formData.append("profession", dataform.profession);
    formData.append("webPage", dataform.webPage || "");
    formData.append("email", dataform.email || "");
    formData.append("description", dataform.description);
    formData.append("indicative", dataform.indicative);
    formData.append("phone", dataform.phone);

    dataform.files.forEach((file) => formData.append("files", file));

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    formState: { errors },
    isSuccess: mutation.isSuccess,
  };
}
