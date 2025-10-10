import { array, boolean, InferType, mixed, number, object, string } from "yup";
import { useMutationHolliday } from "./mutation-holliday";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";
import { useEffect } from "react";

interface Props {
  roominginup: boolean;
  statusup: boolean;
}

const payload = getTokenPayload();

const schema = object({
  iduser: string(),
  property: string().required("Este campo es requerido"),
  name: string().required("Este campo es requerido"),

  // habitaciones con camas
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
  cel: string().required("Este campo es requerido"),
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
  files: mixed<File[]>()
    .test("required", "Debes subir al menos una imagen", (value) => {
      return value && value.length > 0;
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
});

type FormValues = InferType<typeof schema>;

export default function useForm({ roominginup, statusup }: Props) {
  const { data } = useEnsembleInfo();
  const nameunit = data?.[0]?.conjunto.name || "";
  const mutation = useMutationHolliday();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

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
      startDate: "",
      endDate: "",
    },
  });

  const { register, handleSubmit, setValue, control, formState } = methods;
  const { errors } = formState;

  // setear iduser solo en cliente (evita SSR)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const payload = getTokenPayload();
      if (payload?.id) {
        setValue("iduser", String(payload.id), { shouldValidate: false });
      }
    }
  }, [setValue]);

  // Sincronizar los booleans que vienen del componente (roominginup / statusup)
  useEffect(() => {
    setValue("roomingin", roominginup, { shouldValidate: true });
  }, [roominginup, setValue]);

  useEffect(() => {
    setValue("status", statusup, { shouldValidate: true });
  }, [statusup, setValue]);

  // cuando llega info del store/envelope actualizar valores
  useEffect(() => {
    if (idConjunto) {
      setValue("conjunto_id", String(idConjunto));
    }
    if (nameunit) {
      setValue("nameUnit", String(nameunit));
    }
  }, [idConjunto, nameunit, setValue]);

  const onSubmit = handleSubmit(
    async (dataform) => {
      console.log("Entro aca", dataform);
      const formData = new FormData();

      // Condiciones personalizadas (solo manipulan los valores, no hooks)
      if (roominginup) {
        dataform.unitName = String(nameunit);
        dataform.smokingAllowed = false;
        dataform.eventsAllowed = false;
        dataform.status = false;
      }

      if (statusup) {
        // si necesitas lógica adicional cuando statusup=true la pones aquí
        dataform.nameUnit = dataform.nameUnit;
      }

      // Appendeo de campos
      formData.append("iduser", dataform.iduser || "");
      formData.append("property", String(dataform.property));
      formData.append("name", dataform.name);
      formData.append("bedRooms", JSON.stringify(dataform.bedRooms)); // array serializado

      formData.append("maxGuests", String(dataform.maxGuests));
      formData.append("neigborhood", dataform.neigborhood || "");
      formData.append("indicative", dataform.indicative);
      formData.append("city", dataform.city);
      formData.append("country", dataform.country);
      formData.append("address", dataform.address);
      formData.append("tower", String(dataform.tower || ""));
      formData.append("apartment", String(dataform.apartment || ""));
      formData.append("cel", dataform.cel);

      // Amenidades como múltiples append
      (dataform.amenities || [])
        .filter((amenitie): amenitie is string => !!amenitie) // filtra undefined o null
        .forEach((amenitie) => formData.append("amenities", amenitie));
      // Booleans
      formData.append("parking", String(dataform.parking));
      formData.append("petsAllowed", String(dataform.petsAllowed));
      formData.append("smokingAllowed", String(dataform.smokingAllowed));
      formData.append("eventsAllowed", String(dataform.eventsAllowed));
      formData.append("status", String(dataform.status));
      formData.append("residentplace", String(dataform.residentplace));
      formData.append("bartroomPrivate", String(dataform.bartroomPrivate));
      formData.append("roomingin", String(dataform.roomingin));

      // Precios y fees
      formData.append("price", String(dataform.price));
      formData.append("currency", String(dataform.currency || ""));
      formData.append("cleaningFee", String(dataform.cleaningFee));
      formData.append("deposit", String(dataform.deposit));

      formData.append("promotion", String(dataform.promotion || ""));
      formData.append("ruleshome", dataform.ruleshome);
      formData.append("description", dataform.description);

      // Archivos
      (dataform.files || []).forEach((file: File) =>
        formData.append("files", file)
      );

      formData.append("unitName", String(dataform.unitName || ""));
      formData.append("nameUnit", String(dataform.nameUnit || ""));
      formData.append("conjunto_id", String(dataform.conjunto_id || ""));
      formData.append("startDate", String(dataform.startDate || ""));
      formData.append("endDate", String(dataform.endDate || ""));
      await mutation.mutateAsync(formData);
    },
    (errors) => {
      console.log("errores validación:", errors); // verás qué bloquea
    }
  );

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    control,
    formState: { errors },
    isSuccess: mutation.isSuccess,
  };
}
