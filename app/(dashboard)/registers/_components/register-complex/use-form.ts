import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { boolean, mixed, object, string } from "yup";
import { useMutationForm } from "../use-mutation-form";
import { RegisterRequest } from "../../services/request/register";
import { useRef, useState } from "react";
import { useRegisterStore } from "../store/registerStore";

export default function useForm() {
  const { idConjunto } = useRegisterStore();
  console.log("en el use form valor", idConjunto);
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
    name: string().required("Nombre es requerido"),
    lastName: string().required("Apellido es requerido"),
    numberid: string().required("identificación es requerida"),
    city: string().required("ciudad es requerida"),
    phone: string()
      .required("Teléfono es requerido")
      .min(7, "minimo 7 números")
      .max(11, "maximo 11 números"),
    indicative: string().required("indicativo es requerido"),
    email: string().email("Correo inválido").required("Correo es requerido"),
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
      role: "employee",
      conjuntoId: String(idConjunto),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = methods.handleSubmit(async (dataform) => {
    const formData = new FormData();

    if (dataform.name) formData.append("name", dataform.name);
    if (dataform.lastName) formData.append("lastName", dataform.lastName);
    if (dataform.numberid) formData.append("numberid", dataform.numberid);
    if (dataform.city) formData.append("city", dataform.city);
    if (dataform.phone) formData.append("phone", dataform.phone);
    if (dataform.indicative) formData.append("indicative", dataform.indicative);
    if (dataform.email) formData.append("email", dataform.email);
    if (dataform.country) formData.append("country", dataform.country);
    if (dataform.bornDate) formData.append("bornDate", dataform.bornDate);

    formData.append("termsConditions", dataform.termsConditions.toString());

    if (dataform.file) {
      formData.append("file", dataform.file);
    }
    if (dataform.role) {
      formData.append("role", dataform.role);
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
