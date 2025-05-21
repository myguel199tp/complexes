import { InferType, mixed, object, string } from "yup";
import { useMutationVisit } from "./useVisitMutation";
import { useForm as useFormHook } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

const schema = object({
  namevisit: string().required("Nombre es requerido"),
  numberId: string().required("Número de identificación es requerido"),
  nameUnit: string()
    .required("El nombre de la unidad es requerido")
    .default("sanlorenzo"),
  apartment: string().required("Número de casa o apartamento es requerida"),
  plaque: string().optional(),
  startHour: string().optional(),
  file: mixed<File>()
    .nullable()
    .required("El archivo es obligatorio")
    .test(
      "fileSize",
      "El archivo es demasiado grande",
      (value) => !value || value.size <= 5000000
    )
    .test(
      "fileType",
      "Tipo de archivo no soportado",
      (value) => !value || ["image/jpeg", "image/png"].includes(value.type)
    ),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationVisit();
  const getCurrentTime = (): string => {
    const now = new Date();
    return now.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      namevisit: "",
      numberId: "",
      nameUnit: "sanlorenzo",
      apartment: "",
      plaque: "",
      startHour: getCurrentTime(),
      file: undefined,
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("namevisit", dataform.namevisit || "");
    formData.append("numberId", dataform.numberId || "");
    formData.append("nameUnit", dataform.nameUnit || "sanlorenzo");
    formData.append("apartment", dataform.apartment || "");
    formData.append("plaque", dataform.plaque || "");
    formData.append("startHour", dataform.startHour || getCurrentTime());

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
