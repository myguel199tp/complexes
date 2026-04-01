import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { object, string, boolean, mixed, InferType, number } from "yup";
import { useMutationActivity } from "./use-mutation-activity";
import { useEffect } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const schema = object({
  status: boolean().required(),
  type: string(),
  cuantity: number().required("cantidad de residentes es obligatorio"),
  activity: string().required(),
  description: string()
    .required()
    .min(10, "mensajeMinimo10")
    .max(450, "mensajeMaximo450"),
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
      (value) => !value || value.size <= 5_000_000,
    )
    .test(
      "fileType",
      "Tipo de archivo no soportado",
      (value) => !value || ["image/jpeg", "image/png"].includes(value.type),
    ),
  price: number(),
  conjuntoId: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationActivity();

  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      status: false,
      file: undefined,
      conjuntoId: String(idConjunto),
    },
  });

  const { register, handleSubmit, setValue, watch, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
  }, [idConjunto, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();
    formData.append("status", String(dataform.status));
    formData.append("cuantity", String(dataform.cuantity));
    formData.append("activity", dataform.activity);
    formData.append("description", dataform.description);
    formData.append("dateHourStart", String(dataform.dateHourStart));
    formData.append("dateHourEnd", String(dataform.dateHourEnd));
    formData.append("price", String(dataform.price));
    formData.append("duration", String(dataform.duration));
    formData.append("type", String(dataform.type));
    if (dataform.file) {
      formData.append("file", dataform.file);
    }
    formData.append("conjuntoId", String(dataform.conjuntoId));
    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    watch,
    formState: { errors },
    isSuccess: mutation.isSuccess,
  };
}
