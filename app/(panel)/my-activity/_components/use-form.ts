import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { boolean, mixed, object, string } from "yup";
import { useMutationActivity } from "./use-mutation-activity";

type FormValues = {
  status: boolean;
  nameUnit: string;
  activity: string;
  description: string;
  dateHourStart: string | null; // Acepta nulo
  dateHourEnd: string | null; // Acepta nulo
  file: File | null;
};

export default function useForm() {
  const mutation = useMutationActivity();

  const schema = object({
    status: boolean(),
    nameUnit: string().required("El nombre de la unidad es requerido"),
    activity: string(),
    description: string(),
    dateHourStart: string()
      .nullable()
      .required("La fecha de inicio es requerida"),
    dateHourEnd: string()
      .nullable()
      .required("La fecha de finalización es requerida"),
    file: mixed<File>()
      .nullable()
      .test(
        "fileRequired",
        "El archivo es obligatorio",
        (value) => value !== null
      )
      .test("fileSize", "El archivo es demasiado grande (Máx. 5MB)", (value) =>
        value ? value.size <= 5 * 1024 * 1024 : true
      )
      .test(
        "fileType",
        "Tipo de archivo no soportado (Solo JPEG/PNG)",
        (value) =>
          value ? ["image/jpeg", "image/png"].includes(value.type) : true
      ),
  });

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
      file: null,
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = methods.handleSubmit(async (dataform) => {
    console.log("Datos enviados:", dataform);
    const formData = new FormData();

    formData.append("status", String(dataform.status));
    formData.append("nameUnit", dataform.nameUnit);
    formData.append("activity", dataform.activity);
    formData.append("description", dataform.description);
    formData.append("dateHourStart", dataform.dateHourStart ?? "");
    formData.append("dateHourEnd", dataform.dateHourEnd ?? "");

    if (dataform.file) {
      formData.append("file", dataform.file);
    }

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    isSuccess: mutation.isSuccess,
    onSubmit,
  };
}
