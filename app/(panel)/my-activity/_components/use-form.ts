import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { object, string, boolean, mixed, InferType, number } from "yup";
import { useMutationActivity } from "./use-mutation-activity";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";

const payload = getTokenPayload();

const schema = object({
  status: boolean().required(),
  nameUnit: string(),
  nit: string(),
  cuantity: number().required("cantidad de residentes es obligatorio"),
  activity: string().required(),
  description: string().required(),
  dateHourStart: string()
    .nullable()
    .required("La fecha de inicio es requerida"),
  dateHourEnd: string()
    .nullable()
    .required("La fecha de finalización es requerida"),
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
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationActivity();

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      status: false,
      nameUnit: payload?.nameUnit,
      activity: "",
      description: "",
      dateHourStart: "",
      dateHourEnd: "",
      file: undefined,
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();
    formData.append("status", String(dataform.status));
    formData.append("nameUnit", dataform.nameUnit || "");
    formData.append("cuantity", String(dataform.cuantity));
    formData.append("activity", dataform.activity);
    formData.append("description", dataform.description);
    formData.append("dateHourStart", String(dataform.dateHourStart));
    formData.append("dateHourEnd", String(dataform.dateHourEnd));
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
