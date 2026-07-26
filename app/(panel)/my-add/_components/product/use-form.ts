import { InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationProductForm } from "./use-product-mutation";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";

const schema = object({
  sellerId: string(),
  conjuntoId: string(),
  name: string().required("Este campo es requerido"),
  // description y status son @IsNotEmpty en el DTO del backend: si se envían
  // vacíos la petición vuelve con 400, así que se exigen aquí también.
  description: string().required("Este campo es requerido"),
  price: string().required("Este campo es requerido"),
  status: string().required("Selecciona el estado del producto"),
  category: string().required("Selecciona la categoría del producto"),
  files: mixed<File[]>()
    .test("required", "Debes subir al menos una imagen", (value) => {
      return value && value.length > 0;
    })
    .test("minFiles", "Debes subir al menos 1 imagen", (files) => {
      return files ? files.length >= 1 : false;
    })
    .test("maxFiles", "No puedes subir más de 10 imágenes", (files) => {
      return files ? files.length <= 10 : true;
    })
    .test("fileSize", "Cada archivo debe ser menor a 5MB", (files) =>
      files ? files.every((file) => file.size <= 5 * 1024 * 1024) : true,
    )
    .test("fileType", "Solo se permiten archivos JPEG o PNG", (files) =>
      files
        ? files.every((file) => ["image/jpeg", "image/png"].includes(file.type))
        : true,
    ),
});

type FormValues = InferType<typeof schema>;

interface Props {
  sellerId: string;
  /** Para que el formulario limpie también sus previsualizaciones. */
  onPublished?: () => void;
}

export default function useForm({ sellerId, onPublished }: Props) {
  const mutation = useMutationProductForm();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const showAlert = useAlertStore((state) => state.showAlert);

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      conjuntoId: idConjunto || "",
      sellerId,
      status: "",
      category: "",
      files: [],
    },
  });

  const { register, handleSubmit, setValue, control, formState, watch, reset } =
    methods;
  const { errors } = formState;

  const onSubmit = handleSubmit(
    async (dataform) => {
      const formData = new FormData();

      formData.append("sellerId", dataform.sellerId || sellerId);
      formData.append("name", dataform.name || "");
      formData.append("conjuntoId", dataform.conjuntoId ?? "");
      formData.append("status", dataform.status || "");
      formData.append("description", dataform.description || "");
      formData.append("price", dataform.price || "");
      formData.append("category", dataform.category || "");

      (dataform.files || []).forEach((file: File) =>
        formData.append("files", file),
      );

      await mutation.mutateAsync(formData);

      // Ya no se navega tras publicar, así que hay que dejar el formulario
      // limpio para el siguiente producto.
      reset({
        conjuntoId: idConjunto || "",
        sellerId,
        status: "",
        category: "",
        files: [],
      });
      onPublished?.();
    },
    (errors) => {
      // Sin este aviso el botón parecía muerto: la validación fallaba y el
      // único rastro era un console.error.
      const firstMessage = Object.values(errors).find(
        (error) => error?.message,
      )?.message;

      showAlert(firstMessage || "Revisa los campos del formulario", "error");
    },
  );

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    isSuccess: mutation.isSuccess,
    isLoading: mutation.isPending,
  };
}
