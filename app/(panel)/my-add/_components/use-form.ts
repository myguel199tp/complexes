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
  conjuntoId: string(),
  indicative: string().required("indicativo es requerido"),
  profession: string().required("Este campo es requerido"),
  workDays: array(string()).min(1, "Selecciona al menos un día").required(),
  openingHour: string().required("Hora de apertura requerida"),
  closingHour: string().required("Hora de cierre requerida"),
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
      conjuntoId: idConjunto || "",
      files: [],
    },
  });

  const { register, handleSubmit, setValue, formState, control } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
  }, [idConjunto, setValue]);
  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();

    // Campos obligatorios o con fallback
    formData.append("userId", dataform.userId ?? "");
    formData.append("name", dataform.name ?? "");
    formData.append("conjuntoId", dataform.conjuntoId ?? "");
    formData.append("profession", dataform.profession ?? "");
    formData.append("webPage", dataform.webPage ?? "");
    formData.append("instagramred", dataform.instagramred ?? "");
    formData.append("xred", dataform.xred ?? "");
    formData.append("youtubered", dataform.youtubered ?? "");
    formData.append("tiktokred", dataform.tiktokred ?? "");
    formData.append("facebookred", dataform.facebookred ?? "");

    formData.append("email", dataform.email ?? "");
    formData.append("description", dataform.description ?? "");
    formData.append("indicative", dataform.indicative ?? "");
    formData.append("phone", dataform.phone ?? "");

    // ⭐ HORARIOS (evita undefined)
    formData.append("openingHour", dataform.openingHour ?? "");
    formData.append("closingHour", dataform.closingHour ?? "");

    // ⭐ DIAS DE TRABAJO → array seguro
    (dataform.workDays ?? []).forEach((day) => {
      formData.append("workDays", day ?? "");
    });

    // ⭐ ARCHIVOS → evitar error si está vacío
    (dataform.files ?? []).forEach((file) => {
      if (file) formData.append("files", file);
    });

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    control,
    formState: { errors },
    isSuccess: mutation.isSuccess,
  };
}
