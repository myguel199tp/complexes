/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationPayUser } from "../use-pay-mutation";

import { object, string, number, mixed, InferType } from "yup";
import { FeeType } from "../../services/request/adminFee";

const schema = object({
  relationId: string().required("El ID de la relación es obligatorio"),
  amount: number()
    .typeError("El monto debe ser un número")
    .required("El monto es obligatorio"),
  valuepay: string().required("La valor es obligatorio"),
  dueDate: string().required("La fecha de pago es obligatoria"),
  description: string().required("La descripción es obligatoria"),

  customName: string().required("El nombre es obligatorio"),

  status: string().optional(),

  file: mixed<File>()
    .nullable()
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

  type: string().required("El tipo es obligatorio"),
});
type FormValues = InferType<typeof schema>;

export function useFormPayUser(relationId: string) {
  const mutation = useMutationPayUser();

  const methods = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      relationId,
      amount: 0,
      dueDate: "",
      description: "",
      valuepay: "",
      type: FeeType.SALDO_INICIAL,
      customName: "",
      file: undefined,
    },
  });

  const { register, handleSubmit, formState, setValue } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (relationId) {
      setValue("relationId", relationId);
    }
  }, [relationId, setValue]);

  const onSubmit = handleSubmit(
    async (dataform) => {
      console.log("FORM OK");
      console.log(dataform);

      const formData = new FormData();
      formData.append("amount", String(dataform.amount));
      formData.append("description", String(dataform.description));
      formData.append("dueDate", String(dataform.dueDate));
      formData.append("relationId", String(dataform.relationId));
      formData.append("type", String(dataform.type));
      formData.append("customName", String(dataform.customName));
      formData.append("valuepay", String(dataform.valuepay));
      formData.append("status", dataform.status || "PENDING");

      if (dataform.file) {
        formData.append("file", dataform.file);
      }

      await mutation.mutateAsync(formData);
    },
    (errors) => {
      console.log("FORM ERRORS");

      console.log(errors);

      Object.entries(errors).forEach(([field, error]) => {
        console.log(
          `Campo: ${field}`,
          (error as { message?: string })?.message,
        );
      });

      console.log("Valores actuales:");
      console.log(methods.getValues());
    },
  );
  return {
    register,
    handleSubmit: onSubmit,
    isSubmitting: formState.isSubmitting,
    formState: { errors },
    setValue,
    isSuccess: mutation.isSuccess,
  };
}
