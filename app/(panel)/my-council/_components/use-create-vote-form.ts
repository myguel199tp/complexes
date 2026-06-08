import { InferType, array, object, string } from "yup";
import { useForm as useFormHook, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useVoteMutation } from "./use-vote-mutation";

const schema = object({
  meetingId: string().required(),
  title: string().required("El título es requerido"),
  description: string().required("La descripción es requerida"),
  options: array()
    .of(object({ label: string().required("La opción no puede estar vacía") }))
    .min(2, "Se requieren al menos 2 opciones")
    .required(),
});

type FormValues = InferType<typeof schema>;

export function useCreateVoteForm(meetingId: string, onSuccess?: () => void) {
  const mutation = useVoteMutation();

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      meetingId,
      title: "",
      description: "",
      options: [{ label: "" }, { label: "" }],
    },
  });

  const { register, handleSubmit, control, formState } = methods;
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ control, name: "options" });

  const onSubmit = handleSubmit(async (data) => {
    await mutation.mutateAsync({
      meetingId: data.meetingId,
      title: data.title,
      description: data.description,
      options: (data.options ?? []).map((o) => o.label),
    });
    onSuccess?.();
  });

  return {
    register,
    handleSubmit: onSubmit,
    control,
    formState: { errors },
    fields,
    append: () => append({ label: "" }),
    remove,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
  };
}
