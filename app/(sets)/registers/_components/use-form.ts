import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { boolean, mixed, object, string } from "yup";
import { RegisterRequest } from "../services/request/register";
import { useMutationForm } from "./use-mutation-form";
import {
  countryMap,
  phoneLengthByCountry,
} from "@/app/helpers/longitud-telefono";

export default function useForm() {
  const mutation = useMutationForm({
    role: "user",
  });

  const schema = object({
    name: string()
      .required("Nombre es requerido")
      .matches(/^[A-Za-z]+$/, "Solo se permiten letras"),
    lastName: string()
      .required("Apellido es requerido")
      .matches(/^[A-Za-z]+$/, "Solo se permiten letras"),
    numberId: string()
      .required("identificación es requerida")
      .matches(/^[0-9]+$/, "Solo se permiten Numeros"),
    city: string().required("ciudad es requerida"),
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
    indicative: string().required("indicativo es requerido"),
    email: string()
      .email("Correo inválido")
      .required("Correo es requerido")
      .matches(
        /^[\w.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Solo se permiten correo"
      ),
    bornDate: string(),
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
    country: string().required("pais es requerido"),
    role: string().default("employee"),
    conjuntoId: string(),
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
    if (dataform.numberId) formData.append("numberId", dataform.numberId);
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
