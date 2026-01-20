/* eslint-disable react-hooks/rules-of-hooks */
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import { useEffect } from "react";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useCommonAreaMutation } from "./area-mutation";

const schema = object({
  conjuntoId: string(),
  name: string().required("La zona común es obligatoria"),
  description: string().required("El proveedor es obligatorio"),
});

export type FormValues = {
  conjuntoId?: string;
  name: string;
  description: string;
};

export function useFormArea() {
  const createMutation = useCommonAreaMutation();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  const methods = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      conjuntoId: idConjunto || "",
      name: "",
      description: "",
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
  }, [idConjunto, setValue]);
  const onSubmit = handleSubmit(async (data) => {
    await createMutation.mutateAsync(data);
  });

  return {
    ...methods,
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,
    handleSubmit: onSubmit,
    register,
  };
}
