"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { boolean, mixed, object, string } from "yup";
import { useMutationFormReg } from "./use-mutation-form-reg";
import { RegisterRequest } from "../services/request/register";

export default function useForm() {
  const mutation = useMutationFormReg();

  // Si sabes que esto sólo corre en el cliente, no hace falta el guard de window
  const userAddres = localStorage.getItem("addres") || "";

  const userNeigboorhood = localStorage.getItem("neigboorhood") || "";

  const usercitye = localStorage.getItem("citye") || "";

  const usercountrye = localStorage.getItem("countrye") || "";

  const usernit = localStorage.getItem("nites") || "";

  const userunit = localStorage.getItem("unit") || "";

  const schema = object({
    name: string().required("Nombre es requerido"),
    lastName: string().required("Apellido es requerido"),
    city: string().required("Ciudad es requerida").default(usercitye),
    phone: string()
      .required("Teléfono es requerido")
      .min(10, "Mínimo 10 números")
      .max(10, "Máximo 10 números"),
    email: string().email("Correo inválido").required("Correo es requerido"),
    password: string()
      .min(6, "Mínimo 6 caracteres")
      .required("Contraseña es requerida"),
    termsConditions: boolean()
      .oneOf([true], "Debes aceptar los términos y condiciones")
      .required(),
    file: mixed()
      .nullable()
      .test(
        "fileSize",
        "El archivo es demasiado grande",
        (value) => !value || (value instanceof File && value.size <= 5000000)
      )
      .test(
        "fileType",
        "Tipo de archivo no soportado",
        (value) =>
          !value ||
          (value instanceof File &&
            ["image/jpeg", "image/png"].includes(value.type))
      ),
    address: string().required("Dirección es requerida").default(userAddres),
    country: string()
      .required("Nombre de país es requerido")
      .default(usercountrye),
    nameUnit: string().required("nit de conjunto requerido").default(userunit),
    nit: string().required("Nombre de país es requerido").default(usernit),
    neigborhood: string()
      .required("Barrio es requerido")
      .default(userNeigboorhood),
    rol: string().required("Escoja el tipo de usuario"),
    numberid: string(),
    plaque: string(),
    apartment: string(),
  });

  const methods = useFormHook<RegisterRequest>({
    mode: "all",
    resolver: yupResolver(schema) as Resolver<RegisterRequest>,
    defaultValues: {
      termsConditions: true,
      address: String(userAddres),
      neigborhood: String(userNeigboorhood),
      city: String(usercitye),
      country: String(usercountrye),
      nameUnit: String(userunit),
      nit: String(usernit),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();
    if (dataform.name) formData.append("name", dataform.name);
    if (dataform.lastName) formData.append("lastName", dataform.lastName);
    if (dataform.city) formData.append("city", dataform.city);
    if (dataform.phone) formData.append("phone", dataform.phone);
    if (dataform.email) formData.append("email", dataform.email);
    if (dataform.password) formData.append("password", dataform.password);
    if (dataform.nameUnit) formData.append("nameUnit", dataform.nameUnit);
    if (dataform.nit) formData.append("nit", dataform.nit);
    if (dataform.address) formData.append("address", dataform.address);
    if (dataform.country) formData.append("country", dataform.country);
    if (dataform.neigborhood)
      formData.append("neigborhood", dataform.neigborhood);
    formData.append("termsConditions", String(dataform.termsConditions));
    if (dataform.file) formData.append("file", dataform.file);
    if (dataform.rol) formData.append("rol", dataform.rol);
    if (dataform.numberid) formData.append("numberid", dataform.numberid);
    if (dataform.plaque) formData.append("plaque", dataform.plaque);
    if (dataform.apartment) formData.append("apartment", dataform.apartment);

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    formState: { errors },
    isSuccess: mutation.isSuccess,
    onSubmit,
  };
}
