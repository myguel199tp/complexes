import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { mixed, object, string } from "yup";
import { useMutationImmovable } from "./use-immovable-mutation";

type FormValues = {
  iduser: string;
  ofert: string;
  email: string;
  phone: string;
  parking: string;
  neighborhood: string;
  address: string;
  country: string;
  city: string;
  property: string;
  stratum: string;
  price: string;
  room: string;
  restroom: string;
  age: string;
  administration: string;
  area: string;
  description: string;
  files: File[];
  created_at: string;
  finished_at: string;
};

export default function useForm() {
  const mutation = useMutationImmovable();

  const schema = object({
    iduser: string().required("El campo es obligatorio"),
    ofert: string().required("El campo es obligatorio"),
    email: string().required("El campo es obligatorio"),
    phone: string().required("El campo es obligatorio"),
    parking: string().required("El campo es obligatorio"),
    neighborhood: string().required("El campo es obligatorio"),
    address: string().required("El campo es obligatorio"),
    country: string().required("El campo es obligatorio"),
    city: string().required("El campo es obligatorio"),
    property: string().required("El campo es obligatorio"),
    stratum: string().required("El campo es obligatorio"),
    price: string().required("El campo es obligatorio"),
    room: string().required("El campo es obligatorio"),
    restroom: string().required("El campo es obligatorio"),
    age: string().required("El campo es obligatorio"),
    administration: string().required("El campo es obligatorio"),
    area: string().required("El campo es obligatorio"),
    description: string().required("El campo es obligatorio"),
    files: mixed<File[]>()
      .test("required", "Debes subir al menos una imagen", (value) => {
        return value && value.length > 0;
      })
      .test("fileSize", "Cada archivo debe ser menor a 5MB", (files) =>
        files ? files.every((file) => file.size <= 5 * 1024 * 1024) : true
      )
      .test("fileType", "Solo se permiten archivos JPEG o PNG", (files) =>
        files
          ? files.every((file) =>
              ["image/jpeg", "image/png"].includes(file.type)
            )
          : true
      ),
    created_at: string(),
    finished_at: string(),
  });
  const storedUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      iduser: String(storedUserId),
      ofert: "",
      email: "",
      phone: "",
      parking: "",
      neighborhood: "",
      address: "",
      country: "",
      city: "",
      property: "",
      stratum: "",
      price: "",
      room: "",
      restroom: "",
      age: "",
      administration: "",
      area: "",
      description: "",
      files: [],
      created_at: new Date().toISOString(),
      finished_at: new Date(
        new Date().setDate(new Date().getDate() + 30)
      ).toISOString(),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = methods.handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("iduser", dataform.iduser);
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
    formData.append("room", dataform.room);
    formData.append("restroom", dataform.restroom);
    formData.append("age", dataform.age);
    formData.append("administration", dataform.administration);
    formData.append("area", dataform.area);
    formData.append("description", dataform.description);
    if (dataform.files?.length > 0) {
      dataform.files.forEach((file) => formData.append("files", file));
    }
    formData.append("created_at", dataform.created_at);
    formData.append("finished_at", dataform.finished_at);

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    isSuccess: mutation.isSuccess,
    onSubmit,
    methods,
  };
}
