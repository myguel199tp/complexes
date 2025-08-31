import { InferType, array, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { useMutationAddForm } from "./use-mutation-add-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const payload = getTokenPayload();

const schema = object({
  iduser: string(),
  name: string().required("Este campo es requerido"),
  nameUnit: string(),
  conjuntoid: string(),
  profession: string().required("Este campo es requerido"),
  webPage: string().required("Este campo es requerido"),
  email: string(),
  description: string().required("Este campo es requerido"),
  phone: string()
    .required("Teléfono es requerido")
    .min(10, "minimo 10 números")
    .max(10, "maximo 10 números"),
  files: array()
    .of(mixed<File>().required())
    .min(1, "Debes subir al menos una imagen")
    .test("fileSize", "Cada archivo debe ser menor a 5MB", (files = []) =>
      files.every((file) => file.size <= 5 * 1024 * 1024)
    )
    .test("fileType", "Solo se permiten archivos JPEG o PNG", (files = []) =>
      files.every((file) => ["image/jpeg", "image/png"].includes(file.type))
    )
    .required(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationAddForm();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const conjuntoName = useConjuntoStore((state) => state.conjuntoId);

  const createdAt = new Date();
  const finishedAt = new Date(createdAt);
  finishedAt.setDate(finishedAt.getDate() + 20);
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      iduser: String(storedUserId),
      conjuntoid: conjuntoId || "",
      nameUnit: conjuntoName || "",
      files: [],
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();
    formData.append("iduser", dataform.iduser || "");
    formData.append("name", dataform.name);
    formData.append("nameUnit", dataform.nameUnit || "");
    formData.append("conjuntoId", dataform.conjuntoid || "");
    formData.append("profession", dataform.profession);
    formData.append("webPage", dataform.webPage);
    formData.append("email", dataform.email || "");
    formData.append("description", dataform.description);
    formData.append("phone", dataform.phone);

    dataform.files.forEach((file) => formData.append("files", file));

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
