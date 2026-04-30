import { InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useMutationCertificationCert } from "./use-certification-mutate";

const schema = object({
  relationId: string().required(),
  iduser: string().required("El ID del usuario es obligatorio"),
  type: string().required("El tipo es obligatorio"),
  radicado: string().required("El radicado es obligatorio"),
  description: string().optional(),
  tower: string().optional(),
  apartment: string().optional(),
  numberId: string().optional(),
  file: mixed<File>()
    .nullable()
    .required("El archivo es obligatorio")
    .test(
      "fileSize",
      "El archivo es demasiado grande",
      (file) => !file || file.size <= 5_000_000,
    )
    .test(
      "fileType",
      "Solo se permiten archivos PDF",
      (file) => !file || file.type === "application/pdf",
    ),
  nameUnit: string().optional(),
});

type FormValues = InferType<typeof schema>;

export default function useFormCertification(
  relationId: string,
  userId: string,
  radicado: string,
  tower: string,
  apartment: string,
) {
  const mutation = useMutationCertificationCert();
  const conjuntoName = useConjuntoStore((state) => state.conjuntoName);

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      relationId: relationId,
      iduser: userId,
      radicado: radicado,
      tower: String(tower || ""),
      apartment: String(apartment || ""),
      nameUnit: String(conjuntoName || ""),
      file: undefined,
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (conjuntoName) {
      setValue("nameUnit", String(conjuntoName));
    }
  }, [conjuntoName, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();
    formData.append("relationId", String(dataform.relationId));
    formData.append("iduser", String(dataform.iduser));
    formData.append("type", String(dataform.type));
    formData.append("radicado", String(dataform.radicado));
    formData.append("description", String(dataform.description || ""));
    formData.append("tower", String(dataform.tower || ""));
    formData.append("apartment", String(dataform.apartment || ""));
    formData.append("numberId", String(dataform.numberId || ""));
    formData.append("nameUnit", String(dataform.nameUnit || ""));

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
