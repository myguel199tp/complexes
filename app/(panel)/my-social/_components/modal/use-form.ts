import { InferType, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationSocial } from "./mutation-social";

interface Props {
  activityId: string;
}

const schema = object({
  iduser: string().required("El campo es obligatorio"),
  activityId: string().required("Este campo es requerido"),
  description: string().optional(),
  nameUnit: string().required("Este campo es requerido"),
  reservationDate: string().required("Este campo es requerido"),
  created_at: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm({ activityId }: Props) {
  const mutation = useMutationSocial();
  const storedUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      iduser: String(storedUserId),
      activityId: activityId,
      description: "",
      nameUnit: "sanlorenzo",
      reservationDate: "",
      created_at: new Date().toISOString(),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = handleSubmit(async (dataform) => {
    await mutation.mutateAsync(dataform); // ✅ Enviar objeto plano
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    formState: { errors },
    isSuccess: mutation.isSuccess,
  };
}
