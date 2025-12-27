import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { array, boolean, mixed, object, string } from "yup";
import { useMutationForm } from "../use-mutation-form";
import { RegisterRequest, USER_ROLES } from "../../services/request/register";
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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const schema = object({
    name: string()
      .required("Nombre es requerido")
      .matches(/^[A-Za-z\s]+$/, "Solo se permiten letras y espacios"),
    lastName: string()
      .required("Apellido es requerido")
      .matches(/^[A-Za-z\s]+$/, "Solo se permiten letras y espacios"),
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
    referralCode: string(),
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
    roles: array()
      .of(string().oneOf(USER_ROLES))
      .min(1, "Debe tener al menos un rol")
      .required()
      .default(["employee"]),
    conjuntoId: string(),
  });

  const methods = useFormHook<RegisterRequest>({
    mode: "all",
    resolver: yupResolver(schema) as Resolver<RegisterRequest>,
    defaultValues: {
      roles: ["employee"],
      conjuntoId: String(idConjunto),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = methods.handleSubmit(async (dataform) => {
    const formData = new FormData();

    if (dataform.name) formData.append("name", dataform.name);
    if (dataform.lastName) formData.append("lastName", dataform.lastName);
    if (dataform.numberId) formData.append("numberId", dataform.numberId);
    if (dataform.city) formData.append("city", dataform.city);
    if (dataform.phone) formData.append("phone", dataform.phone);
    if (dataform.indicative) formData.append("indicative", dataform.indicative);
    if (dataform.email) formData.append("email", dataform.email);
    if (dataform.country) formData.append("country", dataform.country);
    if (dataform.bornDate) formData.append("bornDate", dataform.bornDate);
    if (dataform.referralCode)
      formData.append("referralCode", dataform.referralCode);
    formData.append("pet", dataform.pet ? "true" : "false");
    formData.append("council", dataform.council ? "true" : "false");
    formData.append("termsConditions", dataform.termsConditions.toString());

    if (dataform.file) {
      formData.append("file", dataform.file);
    }
    if (dataform.roles) {
      formData.append("roles", JSON.stringify(dataform.roles));
    }
    if (dataform.conjuntoId) formData.append("conjuntoId", dataform.conjuntoId);

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
