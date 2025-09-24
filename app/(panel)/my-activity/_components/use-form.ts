import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { object, string, boolean, mixed, InferType, number } from "yup";
import { useMutationActivity } from "./use-mutation-activity";
import { useEffect } from "react";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const schema = object({
  status: boolean().required(),
  nameUnit: string(),
  cuantity: number().required("cantidad de residentes es obligatorio"),
  activity: string().required(),
  description: string().required(),
  dateHourStart: string()
    .nullable()
    .required("La fecha de inicio es requerida"),
  dateHourEnd: string()
    .nullable()
    .required("La fecha de finalización es requerida"),
  duration: number(),
  file: mixed<File>()
    .nullable()
    .required("El archivo es obligatorio")
    .test(
      "fileSize",
      "El archivo es demasiado grande",
      (value) => !value || value.size <= 5_000_000
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
  const mutation = useMutationActivity();
  const { data } = useEnsembleInfo();

  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const userunit = data?.[0]?.conjunto.name || "";

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      status: false,
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
    formData.append("status", String(dataform.status));
    formData.append("nameUnit", dataform.nameUnit || "");
    formData.append("cuantity", String(dataform.cuantity));
    formData.append("activity", dataform.activity);
    formData.append("description", dataform.description);
    formData.append("dateHourStart", String(dataform.dateHourStart));
    formData.append("dateHourEnd", String(dataform.dateHourEnd));
    formData.append("duration", String(dataform.duration));
    if (dataform.file) {
      formData.append("file", dataform.file);
    }
    formData.append("conjunto_id", String(dataform.conjunto_id));
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
