import { boolean, InferType, mixed, number, object, string } from "yup";
import { useMutationHolliday } from "./mutation-holliday";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = object({
  iduser: string().required("El campo es obligatorio"),
  neigborhood: string().required("Este campo es requerido"),
  city: string().required("Este campo es requerido"),
  country: string().required("Este campo es requerido"),
  address: string().required("Este campo es requerido"),
  name: string().required("Este campo es requerido"),
  price: string().required("Este campo es requerido"),
  maxGuests: number().required("Este campo es requerido"),
  property: string().required("Este campo es requerido"),
  parking: string().required("Este campo es requerido"),
  petsAllowed: boolean().required("Este campo es requerido"),
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
  promotion: string().required("Este campo es requerido"),
  nameUnit: string().required("Este campo es requerido"),
  apartment: string().required("Este campo es requerido"),
  cel: string().required("Este campo es requerido"),
  startDate: string().nullable().required("La fecha de inicio es requerida"),
  endDate: string()
    .nullable()
    .required("La fecha de finalización es requerida"),
  created_at: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationHolliday();
  const storedUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      iduser: String(storedUserId),
      neigborhood: "",
      city: "",
      country: "",
      address: "",
      name: "",
      price: "",
      maxGuests: 0,
      property: "",
      parking: "",
      petsAllowed: false,
      ruleshome: "",
      description: "",
      files: [],
      promotion: "",
      nameUnit: "sanlorenzo",
      apartment: "",
      cel: "",
      startDate: "",
      endDate: "",
      created_at: new Date().toISOString(),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();
    formData.append("iduser", dataform.iduser);

    formData.append("neigborhood", dataform.neigborhood);
    formData.append("city", dataform.city);
    formData.append("country", dataform.country);

    formData.append("address", dataform.address);
    formData.append("name", dataform.name);
    formData.append("price", dataform.price);

    formData.append("maxGuests", String(dataform.maxGuests));
    formData.append("property", String(dataform.property));

    formData.append("parking", dataform.parking);
    formData.append("petsAllowed", String(dataform.petsAllowed));

    formData.append("ruleshome", dataform.ruleshome);
    formData.append("description", dataform.description);

    (dataform.files as File[]).forEach((file) =>
      formData.append("files", file)
    );

    formData.append("promotion", String(dataform.promotion));
    formData.append("nameUnit", String(dataform.nameUnit));

    formData.append("apartment", String(dataform.apartment));
    formData.append("cel", dataform.cel);

    formData.append("startDate", String(dataform.startDate));
    formData.append("endDate", String(dataform.endDate));

    formData.append("created_at", String(dataform.created_at));

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
