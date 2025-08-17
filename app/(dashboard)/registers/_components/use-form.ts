import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { boolean, mixed, object, string } from "yup";
import { RegisterRequest } from "../services/request/register";
import { useMutationForm } from "./use-mutation-form";

export default function useForm() {
  const mutation = useMutationForm();

  const schema = object({
    name: string().required("Nombre es requerido"),
    lastName: string().required("Apellido es requerido"),
    country: string().required("Pais es requerido"),
    city: string().required("Ciudad es requerida"),
    phone: string()
      .required("Teléfono es requerido")
      .min(10, "minimo 10 números")
      .max(10, "maximo 10 números"),
    email: string().email("Correo inválido").required("Correo es requerido"),
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
    role: string().default("user"),
  });

  const methods = useFormHook<RegisterRequest>({
    mode: "all",
    resolver: yupResolver(schema) as Resolver<RegisterRequest>,
    defaultValues: {
      role: "user",
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = methods.handleSubmit(async (dataform) => {
    const formData = new FormData();

    if (dataform.name) formData.append("name", dataform.name);
    if (dataform.lastName) formData.append("lastName", dataform.lastName);
    if (dataform.country) formData.append("country", dataform.country);
    if (dataform.city) formData.append("city", dataform.city);
    if (dataform.phone) formData.append("phone", dataform.phone);
    if (dataform.email) formData.append("email", dataform.email);
    formData.append("termsConditions", String(dataform.termsConditions));
    if (dataform.file) {
      formData.append("file", dataform.file);
    }
    if (dataform.role) {
      formData.append("role", dataform.role);
    }

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    isSuccess: mutation.isSuccess,
    onSubmit,
  };
}
