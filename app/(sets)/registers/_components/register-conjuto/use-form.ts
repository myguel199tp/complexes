import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { array, mixed, number, object, string } from "yup";
import { useRef, useState } from "react";
import { useMutationConjuntoForm } from "./use-conjunto-mutation";
import { RegisterConjuntoRequest } from "../../services/request/conjuntoRequest";
import { useRegisterStore } from "../store/registerStore";
import {
  countryMap,
  phoneLengthByCountry,
} from "@/app/helpers/longitud-telefono";
import { useSearchParams } from "next/navigation";

export default function useForm() {
  const mutation = useMutationConjuntoForm();
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

  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  const { prices, quantity, plan, currency } = useRegisterStore();

  // ✅ Esquema de validación Yup con longitud dinámica
  const schema = object({
    name: string()
      .required("Nombre es requerido")
      .matches(/^[A-Za-z0-9 ]+$/, "Solo se permiten letras"),

    nit: string()
      .required("NIT es requerido")
      .matches(/^[A-Za-z0-9 ]+$/, "Solo se permiten letras y numeros"),
    address: string()
      .required("Dirección es requerida")
      .matches(
        /^[A-Za-zBÁÉÍÓÚáéíóúñÑ0-9\s\-\#\,\.\/]+$/,
        "Solo se permiten letras"
      ),
    country: string().required("País es requerido"),
    city: string().required("Ciudad es requerida"),
    neighborhood: string()
      .required("Barrio o sector es requerido")
      .matches(/^[A-Za-z0-9 ]+$/, "Solo se permiten letras y numeros"),
    typeProperty: array().of(string()).required("Tipo propiedad requerido"),
    indicative: string().required("Indicativo es requerido"),
    fundador: string(),
    cellphone: string()
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

    prices: number(),
    currency: string(),
    plan: string(),
    quantityapt: number(),
    file: mixed()
      .nullable()
      .test(
        "fileSize",
        "El archivo es demasiado grande (máx. 5MB)",
        (value) => !value || (value instanceof File && value.size <= 5_000_000)
      )
      .test(
        "fileType",
        "Tipo de archivo no soportado (solo JPG o PNG)",
        (value) =>
          !value ||
          (value instanceof File &&
            ["image/jpeg", "image/png"].includes(value.type))
      ),
  });

  // ✅ Integración con React Hook Form
  const methods = useFormHook<RegisterConjuntoRequest>({
    mode: "all",
    resolver: yupResolver(schema) as Resolver<RegisterConjuntoRequest>,
    defaultValues: {
      fundador: type ?? "",
      prices: prices,
      currency: currency,
      quantityapt: quantity,
      plan: plan,
    },
  });

  const { register, setValue, formState, control } = methods;
  const { errors } = formState;

  const onSubmit = methods.handleSubmit(async (dataform) => {
    const formData = new FormData();
    formData.append("name", dataform.name ?? "");
    formData.append("nit", dataform.nit ?? "");
    formData.append("address", dataform.address ?? "");
    formData.append("fundador", dataform.fundador ?? "");
    formData.append("country", dataform.country ?? "");
    formData.append("city", dataform.city ?? "");
    formData.append("neighborhood", dataform.neighborhood ?? "");
    formData.append("indicative", dataform.indicative ?? "");
    formData.append("cellphone", dataform.cellphone ?? "");
    formData.append("plan", dataform.plan ?? "");

    if (dataform.typeProperty && Array.isArray(dataform.typeProperty)) {
      formData.append("typeProperty", JSON.stringify(dataform.typeProperty));
    }

    formData.append("prices", dataform.prices?.toString() ?? "0");
    formData.append("currency", dataform.currency?.toString() ?? "COP");
    formData.append("quantityapt", dataform.quantityapt?.toString() ?? "0");

    if (dataform.file) {
      formData.append("file", dataform.file);
    }

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    setFormsvalid,
    formsvalid,
    control,
    formState: { errors },
    isSuccess: mutation.isSuccess,
    fileInputRef,
    handleIconClick,
  };
}
