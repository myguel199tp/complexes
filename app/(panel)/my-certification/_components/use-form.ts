import { boolean, InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationCertification } from "./certification-mutation";
import { useEffect } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";

const schema = object({
  title: string().required("Este campo es requerido"),
  isPublic: boolean().required(),
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
  nameUnit: string(),
  conjunto_id: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationCertification();
  const { data } = useEnsembleInfo();

  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const userunit = data?.[0]?.conjunto.name || "";

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      isPublic: false,
      nameUnit: String(userunit),
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
    if (userunit) {
      setValue("nameUnit", String(userunit));
    }
  }, [idConjunto, userunit, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("title", dataform.title);
    formData.append("isPublic", String(dataform.isPublic));
    if (dataform.file) {
      formData.append("file", dataform.file);
    }
    formData.append("conjunto_id", String(dataform.conjunto_id));
    formData.append("nameUnit", dataform.nameUnit || "");

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
