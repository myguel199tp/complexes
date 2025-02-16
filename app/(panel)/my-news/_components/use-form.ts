import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { mixed, object, string } from "yup";
import { useMutationNewsForm } from "./use-mutation-news-form";

type FormValues = {
  title: string;
  textmessage: string;
  nameUnit: string;
  mailAdmin: string;
  file: File | null;
};

export default function useForm() {
  const mutation = useMutationNewsForm();

  const schema = object({
    title: string().required("El título es requerido"),
    textmessage: string().required("El mensaje es requerido"),
    nameUnit: string()
      .required("El nombre de la unidad es requerido")
      .default("sanlorenzo"),
    mailAdmin: string()
      .email("Correo inválido")
      .required("El correo es requerido"),
    file: mixed<File>()
      .nullable()
      .required("El archivo es obligatorio")
      .test(
        "fileSize",
        "El archivo es demasiado grande",
        (value) => !value || value.size <= 5000000 // Limita a 5 MB
      )
      .test(
        "fileType",
        "Tipo de archivo no soportado",
        (value) => !value || ["image/jpeg", "image/png"].includes(value.type)
      ),
  });

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      textmessage: "",
      nameUnit: "sanlorenzo",
      mailAdmin: "admon@gmail.com",
      file: null,
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = methods.handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("title", dataform.title || "");
    formData.append("mailAdmin", dataform.mailAdmin || "admon@gmail.com");
    formData.append("nameUnit", dataform.nameUnit || "sanlorenzo");
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
