import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { array, boolean, InferType, mixed, object, string } from "yup";
import { useMutationForm } from "../use-mutation-form";
import { USER_ROLES } from "../../services/request/register";
import { useRef, useState } from "react";
import { useRegisterStore } from "../store/registerStore";
import {
  countryMap,
  phoneLengthByCountry,
} from "@/app/helpers/longitud-telefono";

export default function useForm() {
  const { idConjunto } = useRegisterStore();
  const mutation = useMutationForm({ idConjunto });

  const [formsvalid, setFormsvalid] = useState({
    toogle: false,
    preview: "",
    showPassword: false,
    selectedOption: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const schema = object({
    name: string()
      .required("Nombre es requerido")
      .matches(/^[A-Za-z\s]+$/, "Solo se permiten letras y espacios"),

    lastName: string()
      .required("Apellido es requerido")
      .matches(/^[A-Za-z\s]+$/, "Solo se permiten letras y espacios"),

    numberId: string()
      .required("Identificación es requerida")
      .matches(/^[0-9]+$/, "Solo se permiten números"),

    city: string().required("Ciudad es requerida"),

    phone: string()
      .required("Teléfono es requerido")
      .matches(/^[0-9]+$/, "Solo se permiten números")
      .test(
        "len",
        "Longitud inválida para el país seleccionado",
        function (value) {
          const { indicative } = this.parent;
          if (!indicative || !value) return true;

          const countryName = indicative.split("-")[1]?.trim()?.toUpperCase();

          const countryCode = countryMap[countryName];
          const expectedLength = phoneLengthByCountry[countryCode ?? ""];

          if (!expectedLength) return true;

          return value.length === expectedLength;
        },
      ),

    indicative: string().required("Indicativo es requerido"),

    email: string()
      .email("Correo inválido")
      .required("Correo es requerido")
      .matches(
        /^[\w.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Formato de correo inválido",
      ),

    bornDate: string().optional(),

    referralCode: string().optional(),

    termsConditions: boolean()
      .oneOf([true], "Debes aceptar los términos y condiciones")
      .required(),

    file: mixed<File | null>()
      .nullable()
      .test(
        "fileSize",
        "El archivo es demasiado grande",
        (value) => !value || (value instanceof File && value.size <= 5_000_000),
      )
      .test(
        "fileType",
        "Tipo de archivo no soportado",
        (value) =>
          !value ||
          (value instanceof File &&
            ["image/jpeg", "image/png"].includes(value.type)),
      ),

    country: string().required("País es requerido"),

    roles: array()
      .of(string().oneOf(USER_ROLES))
      .min(1, "Debe tener al menos un rol")
      .required()
      .default(["employee"]),

    conjuntoId: string().optional(),
  });

  type FormValues = InferType<typeof schema>;

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      roles: ["employee"],
      conjuntoId: String(idConjunto),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === "roles") {
        formData.append(key, JSON.stringify(value));
        return;
      }

      if (key === "file" && value instanceof File) {
        formData.append(key, value);
        return;
      }

      if (typeof value === "boolean") {
        formData.append(key, value.toString());
        return;
      }

      formData.append(key, String(value));
    });

    await mutation.mutateAsync(formData);
  });

  return {
    ...methods,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    formsvalid,
    setFormsvalid,
    fileInputRef,
    handleIconClick,
    onSubmit,
    isSuccess: mutation.isSuccess,
  };
}
