import { InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";
import { useMutationCertificationPqr } from "./use-pqr-mutation";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";

const payload = getTokenPayload();

const schema = object({
  iduser: string(),
  type: string().required(),
  radicado: string().required(),
  description: string(),
  tower: string(),
  apartment: string(),
  requestedDate: string(),
  additionalInfo: string(),
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
  conjunto_id: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationCertificationPqr();
  const { data } = useEnsembleInfo();

  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const userunit = data?.[0]?.conjunto.name || "";
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      iduser: String(storedUserId),
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
    formData.append("iduser", String(dataform.iduser));
    formData.append("type", String(dataform.type));
    formData.append("radicado", String(dataform.radicado));
    formData.append("description", String(dataform.description));
    formData.append("tower", String(dataform.tower));
    formData.append("apartment", String(dataform.apartment));
    formData.append("requestedDate", String(dataform.requestedDate));
    formData.append("additionalInfo", String(dataform.additionalInfo));
    formData.append("numberid", String(dataform.numberid));

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
