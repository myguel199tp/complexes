import { useEffect } from "react"; // 👈 importar aquí
import { InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { useMutationNewsForm } from "./use-mutation-news-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";

const payload = getTokenPayload();
const useremail = payload?.email || "";

const schema = object({
  title: string().required("El título es requerido"),
  textmessage: string().required("El mensaje es requerido"),
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
  conjunto_id: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const { data } = useEnsembleInfo();

  const conjuntoId = data?.[0]?.conjunto.id || "";
  const userunit = data?.[0]?.conjunto.name || "";

  const mutation = useMutationNewsForm();

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      nameUnit: String(userunit),
      mailAdmin: useremail,
      file: undefined,
      conjunto_id: String(conjuntoId),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  // 🔹 Aquí va el useEffect para actualizar cuando llegue la data
  useEffect(() => {
    if (conjuntoId) {
      setValue("conjunto_id", String(conjuntoId));
    }
    if (userunit) {
      setValue("nameUnit", String(userunit));
    }
  }, [conjuntoId, userunit, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("title", dataform.title || "");
    formData.append("mailAdmin", dataform.mailAdmin || "");
    formData.append("nameUnit", dataform.nameUnit || "");
    formData.append("textmessage", dataform.textmessage || "");

    if (dataform.file) {
      formData.append("file", dataform.file);
    }

    formData.append("conjunto_id", dataform.conjunto_id || "");

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
