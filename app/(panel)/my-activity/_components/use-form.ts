import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { object, string, boolean, mixed, InferType } from "yup";
import { useMutationActivity } from "./use-mutation-activity";

const schema = object({
  status: boolean().required(),
  nameUnit: string().required("El nombre de la unidad es requerido"),
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
      nameUnit: "sanlorenzo",
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
    formData.append("nameUnit", dataform.nameUnit);
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
