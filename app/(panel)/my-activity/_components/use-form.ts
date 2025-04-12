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
  files: File[]; // 👈 Ahora es un array
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
    files: mixed<File[]>()
      .test("required", "Debes subir al menos una imagen", (value) => {
        return value && value.length > 0;
      })
      .test("fileSize", "Cada archivo debe ser menor a 5MB", (files) =>
        files ? files.every((file) => file.size <= 5 * 1024 * 1024) : true
      )
      .test("fileType", "Solo se permiten archivos JPEG o PNG", (files) =>
        files
          ? files.every((file) =>
              ["image/jpeg", "image/png"].includes(file.type)
            )
          : true
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
      files: [],
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = methods.handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("status", String(dataform.status));
    formData.append("nameUnit", dataform.nameUnit);
    formData.append("activity", dataform.activity);
    formData.append("description", dataform.description);
    formData.append("dateHourStart", String(dataform.dateHourStart));
    formData.append("dateHourEnd", String(dataform.dateHourEnd));

    if (dataform.files?.length > 0) {
      dataform.files.forEach((file) => formData.append("files", file));
    }
    console.log("formData", formData);
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
