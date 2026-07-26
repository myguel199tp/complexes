import { InferType, mixed, number, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationServiceForm } from "./use-service-mutation";

/**
 * Alta de un servicio.
 *
 * Los campos que lo diferencian de un producto son `durationMinutes`,
 * `minNoticeHours` y `maxDaysAhead`: son los tres datos con los que el backend
 * arma la agenda. Un producto no los necesita; un servicio no funciona sin
 * ellos, porque sin duración no hay franjas que ofrecer.
 */
const schema = object({
  name: string().required("Este campo es requerido"),
  description: string().required("Describe qué incluye el servicio"),
  price: number()
    .typeError("El precio debe ser un número")
    .min(0, "El precio no puede ser negativo")
    .required("Este campo es requerido"),
  category: string().required("Este campo es requerido"),

  durationMinutes: number()
    .typeError("La duración debe ser un número")
    .min(5, "La duración mínima es de 5 minutos")
    .max(600, "La duración máxima es de 10 horas")
    .required("¿Cuánto dura el servicio?"),

  minNoticeHours: number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .max(168, "Máximo una semana de antelación")
    .required("Este campo es requerido"),

  maxDaysAhead: number()
    .typeError("Debe ser un número")
    .min(1, "Al menos un día")
    .max(365, "Máximo un año")
    .required("Este campo es requerido"),

  files: mixed<File[]>()
    .test(
      "required",
      "Debes subir al menos una imagen",
      (value) => !!value && value.length > 0,
    )
    .test("maxFiles", "No puedes subir más de 3 imágenes", (files) =>
      files ? files.length <= 3 : true,
    )
    .test("fileSize", "Cada archivo debe ser menor a 5MB", (files) =>
      files ? files.every((file) => file.size <= 5 * 1024 * 1024) : true,
    )
    .test("fileType", "Solo se permiten archivos JPEG o PNG", (files) =>
      files
        ? files.every((file) => ["image/jpeg", "image/png"].includes(file.type))
        : true,
    ),
});

export type ServiceFormValues = InferType<typeof schema>;

interface Props {
  sellerId: string;
}

export default function useForm({ sellerId }: Props) {
  const mutation = useMutationServiceForm();

  const methods = useFormHook<ServiceFormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      // Valores que sirven para la mayoría de servicios de barrio: se agenda
      // con dos horas y hasta un mes hacia adelante.
      durationMinutes: 60,
      minNoticeHours: 2,
      maxDaysAhead: 30,
      files: [],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = methods;

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("sellerId", sellerId);
    formData.append("name", dataform.name);
    formData.append("description", dataform.description);
    formData.append("price", String(dataform.price));
    formData.append("category", dataform.category);
    formData.append("durationMinutes", String(dataform.durationMinutes));
    formData.append("minNoticeHours", String(dataform.minNoticeHours));
    formData.append("maxDaysAhead", String(dataform.maxDaysAhead));

    (dataform.files || []).forEach((file: File) =>
      formData.append("files", file),
    );

    await mutation.mutateAsync(formData);

    reset({
      durationMinutes: 60,
      minNoticeHours: 2,
      maxDaysAhead: 30,
      files: [],
    });
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    formState: { errors },
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
  };
}
