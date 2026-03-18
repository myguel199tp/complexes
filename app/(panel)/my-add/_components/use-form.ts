"use client";

import { InferType, array, boolean, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { useMutationAddForm } from "./use-mutation-add-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  countryMap,
  phoneLengthByCountry,
} from "@/app/helpers/longitud-telefono";
import { useEffect } from "react";

const schema = object({
  userId: string(),
  name: string().required("Este campo es requerido"),
  conjuntoId: string(),
  typeOfert: string()
    .oneOf(["PRODUCT", "SERVICE"], "Tipo de oferta inválido")
    .required("Tipo de oferta es requerido"),
  indicative: string().required("indicativo es requerido"),
  profession: string().required("Este campo es requerido"),
  workDays: array(string()).min(1, "Selecciona al menos un día").required(),
  openingHour: string().required("Hora de apertura requerida"),
  closingHour: string().required("Hora de cierre requerida"),
  webPage: string().optional(),
  statusOut: boolean().required(),
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

        const countryName = indicative.split("-")[1]?.trim()?.toUpperCase();
        const countryCode = countryMap[countryName];
        const expectedLength = phoneLengthByCountry[countryCode ?? ""];

        if (!expectedLength) return true;
        return value.length === expectedLength;
      },
    ),
  files: array()
    .of(mixed<File>().required())
    .min(1, "Debes subir al menos una imagen")
    .test("fileSize", "Cada archivo debe ser menor a 5MB", (files = []) =>
      files.every((file) => file.size <= 5 * 1024 * 1024),
    )
    .test("fileType", "Solo se permiten archivos JPEG o PNG", (files = []) =>
      files.every((file) => ["image/jpeg", "image/png"].includes(file.type)),
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
  const storedUserId = useConjuntoStore((state) => state.userId);

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      userId: String(storedUserId),
      conjuntoId: idConjunto || "",
      typeOfert: "PRODUCT",
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

    formData.append("userId", dataform.userId ?? "");
    formData.append("name", dataform.name ?? "");
    formData.append("conjuntoId", dataform.conjuntoId ?? "");
    formData.append("typeOfert", dataform.typeOfert ?? "PRODUCT");
    formData.append("profession", dataform.profession ?? "");
    formData.append("webPage", dataform.webPage ?? "");
    formData.append("instagramred", dataform.instagramred ?? "");
    formData.append("xred", dataform.xred ?? "");
    formData.append("youtubered", dataform.youtubered ?? "");
    formData.append("tiktokred", dataform.tiktokred ?? "");
    formData.append("facebookred", dataform.facebookred ?? "");
    formData.append("statusOut", String(dataform.statusOut ?? false));
    formData.append("email", dataform.email ?? "");
    formData.append("description", dataform.description ?? "");
    formData.append("indicative", dataform.indicative ?? "");
    formData.append("phone", dataform.phone ?? "");
    formData.append("openingHour", dataform.openingHour ?? "");
    formData.append("closingHour", dataform.closingHour ?? "");

    (dataform.workDays ?? []).forEach((day) => {
      formData.append("workDays", day ?? "");
    });

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
