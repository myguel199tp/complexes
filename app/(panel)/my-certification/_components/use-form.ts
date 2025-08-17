import { InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationCertification } from "./certification-mutation";
import { useEffect } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const schema = object({
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
      (file) => !file || file.type === "application/pdf"
    ),
  conjunto_id: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationCertification();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      file: undefined,
      conjunto_id: String(idConjunto),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjunto_id", String(idConjunto));
    }
  }, [idConjunto, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("title", dataform.title);
    if (dataform.file) {
      formData.append("file", dataform.file);
    }

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
