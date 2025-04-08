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
      .test(
        "required",
        "Al menos un archivo es requerido",
        (value) => value && value.length > 0
      )
      .test("fileSize", "Uno o más archivos son demasiado grandes", (value) =>
        value ? value.every((file) => file.size <= 5000000) : true
      )
      .test("fileType", "Tipo de archivo no soportado", (value) =>
        value
          ? value.every((file) =>
              ["image/jpeg", "image/png"].includes(file.type)
            )
          : true
      ),
  });

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      iduser: "678bfcb89154f6898a861cc6",
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
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = methods.handleSubmit(
    async (dataform) => {
      console.log("Datos enviados:", dataform);
      const formData = new FormData();

      if (dataform.iduser) formData.append("iduser", dataform.iduser);
      if (dataform.ofert) formData.append("ofert", dataform.ofert);
      if (dataform.email) formData.append("email", dataform.email);
      if (dataform.phone) formData.append("phone", String(dataform.phone));
      if (dataform.parking) formData.append("parking", dataform.parking);
      if (dataform.neighborhood)
        formData.append("neighborhood", dataform.neighborhood);
      if (dataform.address) formData.append("address", dataform.address);
      if (dataform.country) formData.append("country", dataform.country);
      if (dataform.city) formData.append("city", dataform.city);
      if (dataform.property) formData.append("property", dataform.property);
      if (dataform.stratum) formData.append("phone", dataform.stratum);
      if (dataform.price) formData.append("parking", dataform.price);
      if (dataform.room) formData.append("room", dataform.room);
      if (dataform.city) formData.append("restroom", dataform.restroom);
      if (dataform.age) formData.append("age", dataform.age);
      if (dataform.administration)
        formData.append("administration", dataform.administration);
      if (dataform.area) formData.append("area", dataform.area);
      if (dataform.description)
        formData.append("description", dataform.description);
      if (dataform.files && dataform.files.length > 0) {
        dataform.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      mutation.mutateAsync(formData);
    },
    (errors) => {
      console.log("Errores de validación:", errors);
    }
  );

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
