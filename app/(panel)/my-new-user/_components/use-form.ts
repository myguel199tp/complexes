import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { boolean, mixed, object, string } from "yup";
import { useMutationFormReg } from "./use-mutation-form-reg";
import { RegisterRequest } from "../services/request/register";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useRef, useState } from "react";

export default function useForm() {
  const mutation = useMutationFormReg();
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

  const payload = getTokenPayload();
  const userAddres = payload?.address || "";
  const userNeigboorhood = payload?.neigborhood || "";
  const usercitye = payload?.city || "";
  const usercountrye = payload?.country || "";
  const userunit = payload?.nameUnit || "";

  const schema = object({
    name: string().required("Nombre es requerido"),
    lastName: string().required("Apellido es requerido"),
    city: string(),
    phone: string()
      .required("Teléfono es requerido")
      .min(10, "Mínimo 10 números")
      .max(10, "Máximo 10 números"),
    email: string().email("Correo inválido").required("Correo es requerido"),
    password: string()
      .min(6, "Mínimo 6 caracteres")
      .required("Contraseña es requerida"),
    termsConditions: boolean().oneOf(
      [true],
      "Debes aceptar los términos y condiciones"
    ),
    nameUnit: string(),
    nit: string(),
    address: string(),
    neigborhood: string(),
    country: string(),
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
    rol: string().required("Escoja el tipo de usuario"),
    numberid: string().required("Cédula es obligatoria"),
    plaque: string().nullable(),
    apartment: string().nullable(),
  });

  const methods = useFormHook<RegisterRequest>({
    mode: "all",
    resolver: yupResolver(schema) as Resolver<RegisterRequest>,
    defaultValues: {
      termsConditions: true,
      address: userAddres,
      neigborhood: userNeigboorhood,
      city: usercitye,
      country: usercountrye,
      nameUnit: userunit,
      nit: payload?.nit ?? "",
    },
  });

  const { register, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = methods.handleSubmit(async (dataform) => {
    console.log("🚀 onSubmit fired, data:", dataform);
    const formData = new FormData();

    if (dataform.name) formData.append("name", dataform.name);
    if (dataform.lastName) formData.append("lastName", dataform.lastName);
    if (dataform.city) formData.append("city", dataform.city);
    if (dataform.phone) formData.append("phone", dataform.phone);
    if (dataform.email) formData.append("email", dataform.email);
    if (dataform.password) formData.append("password", dataform.password);
    formData.append("termsConditions", String(dataform.termsConditions));
    if (dataform.nameUnit) formData.append("nameUnit", dataform.nameUnit);
    if (dataform.nit) formData.append("nit", dataform.nit);
    if (dataform.address) formData.append("address", dataform.address);
    if (dataform.neigborhood)
      formData.append("neigborhood", dataform.neigborhood);
    if (dataform.country) formData.append("country", dataform.country);

    if (dataform.file) {
      formData.append("file", dataform.file);
    }
    if (dataform.rol) {
      formData.append("rol", dataform.rol);
    }

    if (dataform.numberid) formData.append("numberid", dataform.numberid);
    if (dataform.plaque) formData.append("plaque", dataform.plaque);
    if (dataform.apartment) formData.append("apartment", dataform.apartment);

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    setFormsvalid,
    formsvalid,
    formState: { errors },
    isSuccess: mutation.isSuccess,
    fileInputRef,
    handleIconClick,
  };
}
