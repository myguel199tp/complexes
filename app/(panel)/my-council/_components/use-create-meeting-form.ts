import { InferType, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useMeetMutation } from "./use-meet-mutation";

const schema = object({
  title: string().required("El título es requerido"),
  description: string().required("La descripción es requerida"),
  date: string().nullable().required("La fecha es requerida"),
  conjuntoId: string(),
});

type FormValues = InferType<typeof schema>;

export function useCreateMeetingForm(onSuccess?: () => void) {
  const mutation = useMeetMutation();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      conjuntoId: String(conjuntoId),
    },
  });

  const { register, handleSubmit, control, setValue, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (conjuntoId) {
      setValue("conjuntoId", String(conjuntoId));
    }
  }, [conjuntoId, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    await mutation.mutateAsync({
      title: data.title,
      description: data.description,
      date: data.date ?? undefined,
      conjuntoId: String(data.conjuntoId),
    });
    onSuccess?.();
  });

  return {
    register,
    handleSubmit: onSubmit,
    control,
    setValue,
    formState: { errors },
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
  };
}
