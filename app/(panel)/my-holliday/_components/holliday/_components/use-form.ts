import { array, boolean, InferType, mixed, number, object, string } from "yup";
import { useMutationHolliday } from "./mutation-holliday";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useEffect } from "react";
import {
  countryMap,
  phoneLengthByCountry,
} from "@/app/helpers/longitud-telefono";

interface Props {
  roominginup: boolean;
  statusup: boolean;
  address?: string;
  city?: string;
  country?: string;
  neigborhood?: string;
}

const payload = getTokenPayload();

const schema = object({
  iduser: string(),
  property: string().required("Este campo es requerido"),
  name: string().required("Este campo es requerido"),
  anfitrion: string(),
  bedRooms: array()
    .of(
      object({
        name: string().optional(),
        beds: number()
          .required("Este campo es requerido")
          .min(1, "Debe tener al menos 1 cama"),
      })
    )
    .min(1, "Debes ingresar al menos una habitación")
    .required("Debes ingresar al menos una habitación"),

  maxGuests: number().required("Este campo es requerido"),
  neigborhood: string().required("Este campo es requerido"),
  indicative: string().required("indicativo es requerido"),
  city: string().required("Este campo es requerido"),
  country: string().required("Este campo es requerido"),
  address: string().required("Este campo es requerido"),
  tower: string().optional(),
  apartment: string().optional(),
  cel: string()
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
  amenities: array().of(string()).optional(),
  parking: boolean(),
  petsAllowed: boolean(),
  smokingAllowed: boolean(),
  eventsAllowed: boolean(),
  status: boolean(),
  residentplace: boolean(),
  bartroomPrivate: boolean(),
  roomingin: boolean(),
  price: string().required("Este campo es requerido"),
  currency: string(),
  cleaningFee: number().required("Este campo es requerido"),
  deposit: number().required("Este campo es requerido"),
  promotion: string().required("Este campo es requerido"),
  ruleshome: string().required("Este campo es requerido"),
  description: string().required("Este campo es requerido"),
  image: string(),
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
  unitName: string(),
  nameUnit: string(),
  conjunto_id: string(),
  startDate: string().nullable().required("La fecha de inicio es requerida"),
  endDate: string()
    .nullable()
    .required("La fecha de finalización es requerida"),
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
});

type FormValues = InferType<typeof schema>;

export default function useForm({
  roominginup,
  statusup,
  address,
  city,
  country,
  neigborhood,
}: Props) {
  const mutation = useMutationHolliday();
  const nameunit = useConjuntoStore((state) => state.conjuntoName);
  const anfitrion = useConjuntoStore((state) => state.nameUser);
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const image = useConjuntoStore((state) => state.image);
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  const tower = useConjuntoStore((state) => state.tower);
  const apartment = useConjuntoStore((state) => state.apartment);
  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      iduser: String(storedUserId),
      nameUnit: String(nameunit),
      conjunto_id: String(idConjunto),
      bedRooms: roominginup ? [] : [{ name: "Habitación 1", beds: 1 }],
      parking: false,
      petsAllowed: false,
      smokingAllowed: false,
      eventsAllowed: false,
      status: false,
      residentplace: false,
      bartroomPrivate: false,
      roomingin: false,
      amenities: [],
      files: [],
      image: String(image),
      anfitrion: String(anfitrion),
      startDate: "",
      endDate: "",
    },
  });

  const { register, handleSubmit, setValue, control, formState, watch } =
    methods;
  const { errors } = formState;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const payload = getTokenPayload();
      if (payload?.id) {
        setValue("iduser", String(payload.id), { shouldValidate: false });
      }
    }
  }, [setValue]);

  useEffect(() => {
    setValue("roomingin", roominginup, { shouldValidate: true });
  }, [roominginup, setValue]);

  useEffect(() => {
    setValue("status", statusup, { shouldValidate: true });
  }, [statusup, setValue]);

  useEffect(() => {
    if (idConjunto) {
      setValue("conjunto_id", String(idConjunto));
    }
    if (nameunit) {
      setValue("nameUnit", String(nameunit));
    }

    if (anfitrion) {
      setValue("anfitrion", String(anfitrion));
    }

    if (image) {
      setValue("image", String(image));
    }
  }, [idConjunto, nameunit, anfitrion, image, setValue]);

  const onSubmit = handleSubmit(
    async (dataform) => {
      const formData = new FormData();

      if (roominginup) {
        dataform.unitName = String(nameunit);
        dataform.smokingAllowed = false;
        dataform.eventsAllowed = false;
        dataform.status = false;
      }

      if (statusup) {
        dataform.nameUnit = dataform.nameUnit;
      }

      formData.append("iduser", dataform.iduser || "");
      formData.append("property", String(dataform.property));
      formData.append("name", dataform.name);
      formData.append("bedRooms", JSON.stringify(dataform.bedRooms));

      formData.append("maxGuests", String(dataform.maxGuests));
      formData.append(
        "neigborhood",
        dataform.neigborhood || String(neigborhood)
      );
      formData.append("indicative", dataform.indicative);
      formData.append("city", dataform.city || String(city));
      formData.append("country", dataform.country || String(country));
      formData.append("address", dataform.address || String(address));
      formData.append("tower", String(dataform.tower || String(tower)));
      formData.append(
        "apartment",
        String(dataform.apartment || String(apartment))
      );
      formData.append("cel", dataform.cel);
      formData.append("image", dataform.image || "");
      formData.append("anfitrion", dataform.anfitrion || "");

      (dataform.amenities || [])
        .filter((amenitie): amenitie is string => !!amenitie)
        .forEach((amenitie) => formData.append("amenities", amenitie));
      formData.append("parking", String(dataform.parking));
      formData.append("petsAllowed", String(dataform.petsAllowed));
      formData.append("smokingAllowed", String(dataform.smokingAllowed));
      formData.append("eventsAllowed", String(dataform.eventsAllowed));
      formData.append("status", String(dataform.status));
      formData.append("residentplace", String(dataform.residentplace));
      formData.append("bartroomPrivate", String(dataform.bartroomPrivate));
      formData.append("roomingin", String(dataform.roomingin));

      formData.append("price", String(dataform.price));
      formData.append("currency", String(dataform.currency || ""));
      formData.append("cleaningFee", String(dataform.cleaningFee));
      formData.append("deposit", String(dataform.deposit));

      formData.append("promotion", String(dataform.promotion || ""));
      formData.append("ruleshome", dataform.ruleshome);
      formData.append("description", dataform.description);
      formData.append("videoUrl", String(dataform.videoUrl));
      (dataform.files || []).forEach((file: File) =>
        formData.append("files", file)
      );

      if (dataform.video instanceof File) {
        formData.append("video", dataform.video);
      }

      formData.append("unitName", String(dataform.unitName || ""));
      formData.append("nameUnit", String(dataform.nameUnit || ""));
      formData.append("conjunto_id", String(dataform.conjunto_id || ""));
      formData.append("startDate", String(dataform.startDate || ""));
      formData.append("endDate", String(dataform.endDate || ""));
      await mutation.mutateAsync(formData);
    },
    (errors) => {
      console.log("errores validación:", errors);
    }
  );

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
