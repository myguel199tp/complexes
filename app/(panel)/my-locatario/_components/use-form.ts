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
import { vehicless } from "@/app/(sets)/registers/_components/use-mutation-form";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";

// Para decirle al usuario qué falta cuando la validación no deja enviar.
const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  lastName: "Apellido",
  numberId: "Cédula",
  bornDate: "Fecha de nacimiento",
  indicative: "Indicativo",
  phone: "Celular",
  email: "Correo",
  country: "País",
  city: "Ciudad",
  file: "Foto",
  familyInfo: "Familiares",
};

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

  // ✅ FAMILY CORRECTO
  familyInfo: array()
    .of(
      object({
        nameComplet: string().nullable(),
        lastComplet: string().nullable(),
        numberId: string().nullable(),
        relation: string().nullable(),
        dateBorn: string().nullable(),
        indicative: string().nullable(),
        phones: string().nullable(),
      }),
    )
    .default([]),

  numberId: string().required("Cédula es obligatoria"),
  conjuntoId: string().optional(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationLocatario();
  const showAlert = useAlertStore((state) => state.showAlert);

  const tower = useConjuntoStore((state) => state.tower);
  const apartment = useConjuntoStore((state) => state.apartment);

  const [formsvalid, setFormsvalid] = useState({
    toogle: false,
    preview: "",
    showPassword: false,
    selectedOption: "",
  });

  const [vehicles, setVehicles] = useState<vehicless[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

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
      familyInfo: [], // ✅ importante
      numberId: "",
      conjuntoId: "",
    },
  });

  const { register, setValue, formState, control, watch, handleSubmit } =
    methods;

  const { errors } = formState;

  const onSubmit = handleSubmit(
    async (dataform) => {
      const formData = new FormData();

      Object.entries(dataform).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        if (key === "familyInfo" || key === "pet") return;

        if (key === "file" && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      });

      formData.append("pet", String(!!dataform.pet));

      // Los familiares que quedaron en blanco no se mandan: el backend exige
      // el nombre, y un campo vacío llega como null y no pasa `@IsString`.
      const family = (dataform.familyInfo ?? [])
        .filter((member) => member.nameComplet?.trim())
        .map((member) =>
          Object.fromEntries(
            Object.entries(member).map(([k, v]) => [k, v ?? ""]),
          ),
        );

      if (family.length > 0) {
        formData.append("familyInfo", JSON.stringify(family));
      }

      // torre y apartamento
      formData.append("tower", tower ?? "");
      formData.append("apartment", apartment ?? "");

      // Solo los campos que acepta el backend, que rechaza cualquier otro. Sin
      // celda elegida no se manda: "" no es un UUID válido.
      const validVehicles = vehicles
        .filter((v) => v.plaque?.trim())
        .map((v) => ({
          type: v.type,
          parkingType: v.parkingType,
          plaque: v.plaque.trim(),
          ...(v.parkingSpotId ? { parkingSpotId: v.parkingSpotId } : {}),
        }));

      if (validVehicles.length > 0) {
        formData.append("vehicles", JSON.stringify(validVehicles));
      }

      // `mutate` y no `mutateAsync`: el error ya lo muestra la mutación, y
      // relanzado desde aquí quedaba como promesa rechazada sin atrapar.
      mutation.mutate(formData);
    },
    (formErrors) => {
      // Antes no pasaba nada al hacer clic: la foto no muestra su error y la
      // fecha no recibe el foco, así que el formulario quedaba frenado sin aviso.
      const fields = Object.keys(formErrors).map(
        (key) => FIELD_LABELS[key] ?? key,
      );

      showAlert(`Revisa estos campos: ${fields.join(", ")}`, "error");
    },
  );

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    setFormsvalid,
    control,
    formsvalid,
    formState: { errors },
    isSuccess: mutation.isSuccess,
    isSubmitting: mutation.isLoading,
    fileInputRef,
    handleIconClick,
    watch,

    vehicles,
    setVehicles,
  };
}
