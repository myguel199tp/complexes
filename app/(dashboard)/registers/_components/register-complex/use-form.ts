import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { boolean, mixed, object, string } from "yup";
import { useMutationForm } from "../use-mutation-form";
import { RegisterRequest } from "../../services/request/register";
import { useRef, useState } from "react";

export default function useForm() {
  const mutation = useMutationForm();
  const [formsvalid, setFormsvalid] = useState({
    toogle: false,
    preview: "",
    showPassword: false,
    selectedOption: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const schema = object({
    name: string().required("Nombre es requerido"),
    lastName: string().required("Apellido es requerido"),
    city: string().required("Ciudad es requerida"),
    phone: string()
      .required("Teléfono es requerido")
      .min(10, "minimo 10 numeros")
      .max(10, "maximo 10 nuemros"),
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
    nameUnit: string().required("Nombre de unidad es requerido"),
    nit: string().required("Nombre de unidad es requerido"),
    address: string().required("dirección es requerido"),
    country: string().required("Nombre de pais es requerido"),
    neigborhood: string().required("barrio de pais es requerido"),
    rol: string().default("admins"),
  });

  const methods = useFormHook<RegisterRequest>({
    mode: "all",
    resolver: yupResolver(schema) as Resolver<RegisterRequest>,
    defaultValues: {
      rol: "admins",
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = methods.handleSubmit(async (dataform) => {
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

    if (dataform.file) {
      formData.append("file", dataform.file);
    }
    if (dataform.rol) {
      formData.append("rol", dataform.rol);
    }

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit,
    setValue,
    setFormsvalid,
    formsvalid,
    formState: { errors },
    isSuccess: mutation.isSuccess,
    fileInputRef,
    onSubmit,
    handleIconClick,
  };
}
