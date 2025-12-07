import { InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationProductForm } from "./use-product-mutation";

const schema = object({
  sellerId: string(),
  status: string(),
  name: string().required("Este campo es requerido"),
  description: string(),
  price: string().required("Este campo es requerido"),
  category: string().required("Este campo es requerido"),
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
      files ? files.every((file) => file.size <= 5 * 1024 * 1024) : true
    )
    .test("fileType", "Solo se permiten archivos JPEG o PNG", (files) =>
      files
        ? files.every((file) => ["image/jpeg", "image/png"].includes(file.type))
        : true
    ),
});

type FormValues = InferType<typeof schema>;

interface Props {
  sellerId: string;
}

export default function useForm({ sellerId }: Props) {
  console.log("sellerId", sellerId);
  const mutation = useMutationProductForm();

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      sellerId,
      files: [],
    },
  });

  const { register, handleSubmit, setValue, control, formState, watch } =
    methods;
  const { errors } = formState;

  const onSubmit = handleSubmit(
    async (dataform) => {
      const formData = new FormData();

      formData.append("sellerId", dataform.sellerId || sellerId);
      formData.append("name", dataform.name || "");
      formData.append("status", dataform.status || "");
      formData.append("description", dataform.description || "");
      formData.append("price", dataform.price || "");
      formData.append("category", dataform.category || "");

      (dataform.files || []).forEach((file: File) =>
        formData.append("files", file)
      );

      await mutation.mutateAsync(formData);
    },
    (errors) => {
      console.log("errores validación:", errors);
    }
  );

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    isSuccess: mutation.isSuccess,
  };
}
