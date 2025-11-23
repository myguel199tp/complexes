import { InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useEffect } from "react";
import { useMutationProductForm } from "./use-product-mutation";

const payload = getTokenPayload();

const schema = object({
  sellerId: string(),
  iduser: string(),
  status: string(),
  conjuntoId: string().required("Este campo es requerido"),
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

  conjunto_id: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationProductForm();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      iduser: String(storedUserId),
      conjunto_id: String(idConjunto),
      files: [],
    },
  });

  const { register, handleSubmit, setValue, control, formState, watch } =
    methods;
  const { errors } = formState;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const payload = getTokenPayload();
      if (payload?.id) {
        setValue("iduser", String(payload.id), { shouldValidate: false });
      }
    }
  }, [setValue]);

  useEffect(() => {
    if (idConjunto) {
      setValue("conjunto_id", String(idConjunto));
    }
  }, [idConjunto, setValue]);

  const onSubmit = handleSubmit(
    async (dataform) => {
      const formData = new FormData();

      formData.append("iduser", dataform.iduser || "");

      (dataform.files || []).forEach((file: File) =>
        formData.append("files", file)
      );

      formData.append("conjunto_id", String(dataform.conjunto_id || ""));
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
