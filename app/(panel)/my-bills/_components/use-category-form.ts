import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import { useEffect } from "react";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { CreateExpenseCategoryRequest } from "../services/request/createExpenseCategoryRequest";
import { useCategoryMutation } from "./category-mutation.ts";

const schema = object({
  name: string().required("Nombre de la categoria es obligatorio"),
  description: string(),
  conjuntoId: string().required(),
});

export function useFormCategoty() {
  const createMutation = useCategoryMutation();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  const methods = useForm<CreateExpenseCategoryRequest>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      conjuntoId: idConjunto || "",
    },
  });

  const { handleSubmit, setValue, formState } = methods;

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
    isSubmitting: formState.isSubmitting || createMutation.isPending,
    handleSubmit: onSubmit,
  };
}
