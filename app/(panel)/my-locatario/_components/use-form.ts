/* eslint-disable react-hooks/exhaustive-deps */
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { InferType, array, boolean, mixed, object, string } from "yup";
import { useRef, useState } from "react";

import {
  countryMap,
  phoneLengthByCountry,
} from "@/app/helpers/longitud-telefono";

import { useMutationLocatario } from "./locatario-mutation";

/* -------------------- */
/* 🔥 SCHEMA */
/* -------------------- */

const schema = object({
  name: string().required("Nombre es requerido"),
  lastName: string().required("Apellido es requerido"),
  country: string().required("Pais es requerido"),
  city: string().required("Ciudad es requerido"),

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

  indicative: string().required("Indicativo es requerido"),

  email: string().email("Correo inválido").required("Correo es requerido"),

  bornDate: string().required("Fecha de nacimiento es requerida"),

  pet: boolean().optional(),

  file: mixed()
    .nullable()
    .test(
      "fileSize",
      "El archivo es demasiado grande",
      (value) => !value || (value instanceof File && value.size <= 5000000),
    )
    .test(
      "fileType",
      "Tipo de archivo no soportado",
      (value) =>
        !value ||
        (value instanceof File &&
          ["image/jpeg", "image/png"].includes(value.type)),
    ),

  familyInfo: array()
    .of(
      object({
        relation: string().nullable(),
        nameComplet: string().nullable(),
        numberId: string().nullable(),
        email: string().email().nullable(),
        dateBorn: string().nullable(),
        photo: string().nullable(),
        phones: string().nullable(),
      }),
    )
    .default([]),

  numberId: string().required("Cédula es obligatoria"),

  conjuntoId: string().optional(),
});

/* -------------------- */
/* 🔥 TYPE INFERIDO */
/* -------------------- */

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationLocatario();

  const [formsvalid, setFormsvalid] = useState({
    toogle: false,
    preview: "",
    showPassword: false,
    selectedOption: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  /* -------------------- */
  /* 🔥 REACT HOOK FORM */
  /* -------------------- */

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      lastName: "",
      country: "",
      city: "",
      phone: "",
      indicative: "",
      email: "",
      bornDate: "",
      pet: false,
      file: null,
      familyInfo: [],
      numberId: "",
      conjuntoId: "",
    },
  });

  const { register, setValue, formState, control, watch, handleSubmit } =
    methods;

  const { errors } = formState;

  /* -------------------- */
  /* 🔥 SUBMIT */
  /* -------------------- */

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();

    Object.entries(dataform).forEach(([key, value]) => {
      if (!value) return;

      if (key === "file" && value instanceof File) {
        formData.append(key, value);
      } else if (key === "familyInfo") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    setFormsvalid,
    control,
    formsvalid,
    formState: { errors },
    isSuccess: mutation.isSuccess,
    fileInputRef,
    handleIconClick,
    watch,
  };
}
