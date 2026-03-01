import { useForm as useReactHookForm } from "react-hook-form";
import { InferType, number, object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationRecomendation } from "./mutation-recomendation";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const schema = object({
  place: string().required("El lugar es obligatorio"),
  description: string().required("La descripción es obligatoria"),
  transport: string().required("El transporte es obligatorio"),
  type: string().required("El tipo es obligatorio"),
  distance: string().required("La distancia es obligatoria"),
  estimatedCost: number().required("Costo obligatorio"),
  address: string().required("La dirección es obligatoria"),
  notes: string().optional(),
});

type FormValues = InferType<typeof schema>;

export default function useFormRecomendation(hollidayId: string) {
  const mutationRegister = useMutationRecomendation();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  const methods = useReactHookForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
  });

  const { register, handleSubmit, control, formState, watch } = methods;
  const { errors } = formState;

  const onSubmit = handleSubmit((data) => {
    const payload = {
      hollidayId,
      conjuntoId: idConjunto,
      recommendations: [data],
    };

    mutationRegister.mutate(payload);
  });

  return {
    register,
    handleSubmit: onSubmit,
    watch,
    control,
    errors,
    isSubmitting: mutationRegister.isLoading,
    isSuccess: mutationRegister.isSuccess,
    isError: mutationRegister.isError,
  };
}
