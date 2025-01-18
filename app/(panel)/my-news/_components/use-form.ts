import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { mixed, object, string } from "yup";
import { useMutationNewsForm } from "./use-mutation-news-form";
import { AllNewsRequest } from "../services/request.ts/news-request";

export default function useForm() {
  const mutation = useMutationNewsForm();

  const schema = object({
    title: string().required("titulo es requerido"),
    textmessage: string().required("mensaje es requerido"),
    nameUnit: string()
      .required("nombre de unidad es requerida")
      .default("reservas"),
    mailAdmin: string()
      .email("Correo inválido")
      .required("Correo es requerido")
      .default("admon@gmial.com"),
    file: mixed()
      .nullable()
      .test(
        "fileSize",
        "El archivo es demasiado grande",
        (value) => !value || (value instanceof File && value.size <= 500000000)
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

  const methods = useFormHook<AllNewsRequest>({
    mode: "all",
    resolver: yupResolver(schema) as Resolver<AllNewsRequest>,
    defaultValues: {
      title: "",
      textmessage: "",
      nameUnit: "reservas",
      mailAdmin: "admon@gmial.com",
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;
  const onSubmit = methods.handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("title", dataform.title || "");
    formData.append("mailAdmin", dataform.mailAdmin || "admon@gmial.com");
    formData.append("nameUnit", dataform.nameUnit || "reservas");
    formData.append("textmessage", dataform.textmessage || "");

    if (dataform.file) {
      formData.append("file", dataform.file);
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
