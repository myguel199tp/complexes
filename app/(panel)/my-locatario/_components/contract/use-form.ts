/* eslint-disable react-hooks/exhaustive-deps */
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { InferType, mixed, number, object, string } from "yup";

import { useMutationContract } from "./contract-mutation";

interface Props {
  tenantID: string;
  torre: string;
  apartment: string;
}

const schema = object({
  tenantId: string().required("Inquilino requerido"),
  tower: string().required("Torre requerida"),
  apartment: string().required("Apartamento requerido"),

  rentAmount: number().typeError("Debe ser número").required("Valor requerido"),

  paymentDay: number()
    .typeError("Debe ser número")
    .min(1, "Mínimo 1")
    .max(31, "Máximo 31")
    .required("Día de pago requerido"),

  startDate: string().required("Fecha inicio requerida"),
  endDate: string().required("Fecha fin requerida"),

  notes: string().optional(),

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
});

type FormValues = InferType<typeof schema>;

export default function useFormContract({ tenantID, torre, apartment }: Props) {
  const mutation = useMutationContract();

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      tenantId: tenantID, // ✅ mapping correcto
      tower: torre, // ✅ mapping correcto
      apartment: apartment, // ✅ mapping correcto
    },
  });

  const { register, setValue, handleSubmit, formState } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();

    formData.append("tenantId", data.tenantId);
    formData.append("tower", data.tower);
    formData.append("apartment", data.apartment);
    formData.append("rentAmount", String(data.rentAmount));
    formData.append("paymentDay", String(data.paymentDay));
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);

    if (data.notes) {
      formData.append("notes", data.notes);
    }

    if (data.file instanceof File) {
      formData.append("file", data.file);
    }

    await mutation.mutateAsync(formData);
  });

  return {
    ...methods,
    errors: formState.errors,
    onSubmit,
    register,
    setValue,
    isLoading: mutation.isPending,
  };
}
