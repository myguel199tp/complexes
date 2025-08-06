import { InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationCertification } from "./certification-mutation";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";

const payload = getTokenPayload();
const userunit = payload?.nameUnit || "";

const schema = object({
  iduser: string().required("El campo es obligatorio"),
  nameUnit: string(),
  title: string().required("Este campo es requerido"),
  file: mixed<File>()
    .nullable()
    .required("El archivo es obligatorio")
    .test(
      "fileSize",
      "El archivo es demasiado grande",
      (file) => !file || file.size <= 5_000_000
    )
    .test(
      "fileType",
      "Solo se permiten archivos PDF",
      (file) => !file || file.type === "application/pdf" // ← aquí
    ),

  created_at: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationCertification();
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;
  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      iduser: String(storedUserId),
      nameUnit: userunit,
      title: "",
      file: undefined,
      created_at: new Date().toISOString(),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("iduser", dataform.iduser);
    formData.append("nameUnit", String(dataform.nameUnit));
    formData.append("title", dataform.title);
    if (dataform.file) {
      formData.append("file", dataform.file);
    }
    formData.append(
      "created_at",
      dataform.created_at ?? new Date().toISOString()
    );
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
