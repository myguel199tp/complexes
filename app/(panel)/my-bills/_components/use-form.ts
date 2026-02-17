import { InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useMutationExpense } from "./expense-mutation";

const schema = object({
  concept: string().required("Este campo es requerido"),
  amount: string().required(),
  paymentDate: string().required("La fecha es requerida"),
  period: string().required("Este campo es requerido"),
  categoryId: string().required("Este campo es requerido"),
  observations: string().required("Este campo es requerido"),
  file: mixed<File>()
    .nullable()
    .required("El archivo es obligatorio")
    .test(
      "fileSize",
      "El archivo es demasiado grande",
      (file) => !file || file.size <= 5_000_000,
    )
    .test(
      "fileType",
      "Solo se permiten archivos PDF",
      (file) => !file || file.type === "application/pdf",
    ),
  conjuntoId: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationExpense();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      concept: "",
      amount: "",
      paymentDate: "",
      period: "",
      categoryId: "",
      observations: "",
      file: undefined,
      conjuntoId: String(idConjunto),
    },
  });

  const { register, handleSubmit, control, setValue, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
  }, [idConjunto, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("concept", dataform.concept);
    formData.append("amount", dataform.amount);
    formData.append("paymentDate", dataform.paymentDate);
    formData.append("period", dataform.period);
    formData.append("categoryId", dataform.categoryId);
    formData.append("observations", dataform.observations);
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
    control,
    formState: { errors },
    isSuccess: mutation.isSuccess,
  };
}
