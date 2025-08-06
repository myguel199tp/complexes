import { InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { useMutationNewsForm } from "./use-mutation-news-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";

const payload = getTokenPayload();
const userunit = payload?.nameUnit || "";
const useremail = payload?.email || "";

const schema = object({
  title: string().required("El título es requerido"),
  textmessage: string().required("El mensaje es requerido"),
  nit: string(),
  nameUnit: string(),
  mailAdmin: string()
    .email("Correo inválido")
    .required("El correo es requerido"),
  file: mixed<File>()
    .nullable()
    .required("El archivo es obligatorio")
    .test(
      "fileSize",
      "El archivo es demasiado grande",
      (value) => !value || value.size <= 5000000
    )
    .test(
      "fileType",
      "Tipo de archivo no soportado",
      (value) => !value || ["image/jpeg", "image/png"].includes(value.type)
    ),
  created_at: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationNewsForm();

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      textmessage: "",
      nameUnit: userunit,
      mailAdmin: useremail,
      file: undefined,
      nit: payload?.nit,
      created_at: new Date().toISOString(),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("title", dataform.title || "");
    formData.append("mailAdmin", dataform.mailAdmin || "");
    formData.append("nameUnit", dataform.nameUnit || "");
    formData.append("textmessage", dataform.textmessage || "");
    formData.append("nit", dataform.nit || "");

    if (dataform.file) {
      formData.append("file", dataform.file);
    }

    formData.append("created_at", String(dataform.created_at));

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    formState: { errors },
    isSuccess: mutation.isSuccess,
  };
}
