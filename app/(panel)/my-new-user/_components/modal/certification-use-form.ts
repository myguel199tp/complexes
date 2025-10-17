import { InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useMutationCertificationCert } from "./use-certification-mutate";

const payload = getTokenPayload();

const schema = object({
  relationId: string().required("El ID de la relación es obligatorio"),
  iduser: string(),
  type: string().required(),
  radicado: string().required(),
  description: string(),
  tower: string(),
  apartment: string(),
  numberid: string(),
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
});

type FormValues = InferType<typeof schema>;

export default function useFormCertification(
  relationId: string,
  radicado: string,
  tower: string,
  apartment: string
) {
  const mutation = useMutationCertificationCert();

  const conjuntoName = useConjuntoStore((state) => state.conjuntoName);

  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      relationId,
      iduser: String(storedUserId),
      radicado: radicado,
      tower: String(tower),
      apartment: String(apartment),
      nameUnit: String(conjuntoName),
      file: undefined,
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (relationId) {
      setValue("relationId", relationId);
    }
    if (conjuntoName) {
      setValue("nameUnit", String(conjuntoName));
    }
  }, [conjuntoName, setValue, relationId]);

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();
    formData.append("relationId", String(dataform.relationId));
    formData.append("iduser", String(dataform.iduser));
    formData.append("type", String(dataform.type));
    formData.append("radicado", String(dataform.radicado));
    formData.append("description", String(dataform.description));
    formData.append("tower", String(dataform.tower));
    formData.append("apartment", String(dataform.apartment));
    formData.append("numberid", String(dataform.numberid));

    if (dataform.file) {
      formData.append("file", dataform.file);
    }
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
