import { array, InferType, mixed, object, string } from "yup";
import { useMutationImmovable } from "./use-immovable-mutation";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useEffect } from "react";
import {
  countryMap,
  phoneLengthByCountry,
} from "@/app/helpers/longitud-telefono";

const payload = getTokenPayload();

const schema = object({
  iduser: string(),
  ofert: string().required("El campo oferta es obligatorio"),
  email: string().required("El campo coreo es obligatorio").email(),
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
  parking: string().required("El campo barrio o sector es obligatorio"),
  neighborhood: string().required("El campo barrio o sector es obligatorio"),
  amenitiesResident: array().of(string()).optional(),
  amenities: array().of(string()).optional(),
  address: string().required("El campo dirección es obligatorio"),
  country: string().required("El campo país es obligatorio"),
  city: string().required("El campo ciudad es obligatorio"),
  property: string().required("El campo propiedad es obligatorio"),
  currency: string().required("El campo propiedad es obligatorio"),
  price: string().required("El campo precio es obligatorio"),
  room: string().optional(),
  restroom: string().optional(),
  age: string().required("El campo barrio o sector es obligatorio"),
  administration: string().required("El campo coreo es obligatorio"),
  indicative: string().required("El campo coreo es obligatorio"),
  area: string().required("El campo area es obligatorio"),
  description: string().required("El campo descripción es obligatorio"),
  files: mixed<File[]>()
    .test("required", "Debes subir al menos una imagen", (value) => {
      return value && value.length > 0;
    })
    .test("minFiles", "Debes subir al menos 1 imagen", (files) => {
      return files ? files.length >= 1 : false;
    })
    .test("maxFiles", "No puedes subir más de 10 imágenes", (files) => {
      return files ? files.length <= 10 : true;
    })
    .test("fileSize", "Cada archivo debe ser menor a 5MB", (files) =>
      files ? files.every((file) => file.size <= 5 * 1024 * 1024) : true
    )
    .test("fileType", "Solo se permiten archivos JPEG o PNG", (files) =>
      files
        ? files.every((file) => ["image/jpeg", "image/png"].includes(file.type))
        : true
    ),
  video: mixed<File>()
    .test("fileSize", "El video no debe superar 100 MB", (value) =>
      value instanceof File ? value.size <= 100 * 1024 * 1024 : true
    )
    .test("fileType", "Solo se permiten videos MP4, MOV o AVI", (value) =>
      value instanceof File
        ? ["video/mp4", "video/mov", "video/avi"].includes(value.type)
        : true
    )
    .nullable(),
  videoUrl: string().url("Debe ser un enlace válido").optional(),
  conjuntoId: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationImmovable();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      iduser: String(storedUserId),
      files: [],
      conjuntoId: String(idConjunto),
      amenitiesResident: [],
      amenities: [],
    },
  });

  const { register, handleSubmit, setValue, control, formState, watch } =
    methods;
  const { errors } = formState;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
  }, [idConjunto, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    console.log("ingreso a aca");
    const formData = new FormData();

    formData.append("iduser", dataform.iduser || "");
    formData.append("ofert", dataform.ofert);
    formData.append("email", dataform.email);
    formData.append("phone", dataform.phone);
    formData.append("parking", dataform.parking);
    formData.append("neighborhood", dataform.neighborhood);
    formData.append("address", dataform.address);
    formData.append("country", dataform.country);
    formData.append("city", dataform.city);
    formData.append("property", dataform.property);
    formData.append("currency", dataform.currency);
    formData.append("price", dataform.price);
    formData.append("room", String(dataform.room));
    formData.append("restroom", String(dataform.restroom));
    formData.append("age", dataform.age);
    formData.append("administration", dataform.administration);
    formData.append("indicative", dataform.indicative);
    formData.append("area", dataform.area);
    formData.append("description", dataform.description);
    formData.append("videoUrl", String(dataform.videoUrl));
    if (dataform.video instanceof File) {
      formData.append("video", dataform.video);
    }
    (dataform.files as File[]).forEach((file) =>
      formData.append("files", file)
    );
    formData.append("conjuntoId", String(dataform.conjuntoId));
    (dataform.amenitiesResident || [])
      .filter(
        (amenitiesResident): amenitiesResident is string => !!amenitiesResident
      )
      .forEach((amenitiesResident) =>
        formData.append("amenitiesResident", amenitiesResident)
      );
    (dataform.amenities || [])
      .filter((amenities): amenities is string => !!amenities)
      .forEach((amenities) => formData.append("amenities", amenities));

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    isSuccess: mutation.isSuccess,
  };
}
