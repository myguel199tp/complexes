import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { mixed, number, object, string } from "yup";
import { useRef, useState } from "react";
import { useMutationConjuntoForm } from "./use-conjunto-mutation";
import { RegisterConjuntoRequest } from "../../services/request/conjuntoRequest";
import { useRegisterStore } from "../store/registerStore";

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

  const { prices, quantity } = useRegisterStore();

  const schema = object({
    name: string().required("Nombre es requerido"),
    nit: string().required("Nombre de unidad es requerido"),
    address: string().required("dirección es requerido"),
    country: string().required("Nombre de pais es requerido"),
    city: string().required("Ciudad es requerida"),
    neighborhood: string().required("barrio de pais es requerido"),
    cellphone: string()
      .required("Teléfono es requerido")
      .min(10, "minimo 10 números")
      .max(10, "maximo 10 números"),
    prices: number(),
    quantityapt: number(),
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
  });

  const methods = useFormHook<RegisterConjuntoRequest>({
    mode: "all",
    resolver: yupResolver(schema) as Resolver<RegisterConjuntoRequest>,
    defaultValues: {
      prices: prices,
      quantityapt: quantity,
    },
  });

  const { register, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = methods.handleSubmit(async (dataform) => {
    const formData = new FormData();

    if (dataform.name) formData.append("name", dataform.name);
    if (dataform.nit) formData.append("nit", dataform.nit);
    if (dataform.address) formData.append("address", dataform.address);
    if (dataform.country) formData.append("country", dataform.country);
    if (dataform.city) formData.append("city", dataform.city);
    if (dataform.neighborhood)
      formData.append("neighborhood", dataform.neighborhood);
    if (dataform.cellphone) formData.append("cellphone", dataform.cellphone);
    if (dataform.prices) formData.append("prices", dataform.prices.toString());
    if (dataform.quantityapt)
      formData.append("quantityapt", dataform.quantityapt.toString());

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
    formState: { errors },
    isSuccess: mutation.isSuccess,
    fileInputRef,
    handleIconClick,
  };
}
