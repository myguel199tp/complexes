import { InferType, mixed, object, string } from "yup";
import { useMutationImmovable } from "./use-immovable-mutation";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";

const payload = getTokenPayload();

const schema = object({
  iduser: string(),
  ofert: string().required("El campo oferta es obligatorio"),
  email: string().required("El campo coreo es obligatorio").email(),
  phone: string()
    .required("El campo coreo es obligatorio")
    .min(10, "minimo 10 números")
    .max(10, "maximo 10 números"),
  parking: string().required("El campo barrio o sector es obligatorio"),
  neighborhood: string().required("El campo barrio o sector es obligatorio"),
  address: string().required("El campo dirección es obligatorio"),
  country: string().required("El campo país es obligatorio"),
  city: string().required("El campo ciudad es obligatorio"),
  property: string().required("El campo propiedad es obligatorio"),
  stratum: string().required("El campo estrato es obligatorio"),
  price: string().required("El campo precio es obligatorio"),
  room: string().optional(),
  restroom: string().optional(),
  age: string().required("El campo barrio o sector es obligatorio"),
  administration: string().required("El campo coreo es obligatorio"),
  area: string().required("El campo area es obligatorio"),
  description: string().required("El campo descripción es obligatorio"),
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
  created_at: string(),
  finished_at: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationImmovable();
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      iduser: String(storedUserId),
      files: [],
      created_at: new Date().toISOString(),
      finished_at: new Date(
        new Date().setDate(new Date().getDate() + 30)
      ).toISOString(),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = handleSubmit(async (dataform) => {
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
    formData.append("stratum", dataform.stratum);
    formData.append("price", dataform.price);
    formData.append("room", String(dataform.room));
    formData.append("restroom", String(dataform.restroom));
    formData.append("age", dataform.age);
    formData.append("administration", dataform.administration);
    formData.append("area", dataform.area);
    formData.append("description", dataform.description);
    (dataform.files as File[]).forEach((file) =>
      formData.append("files", file)
    );
    formData.append("created_at", String(dataform.created_at));
    formData.append("finished_at", String(dataform.finished_at));

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
