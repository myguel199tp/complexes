import { InferType, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationSocial } from "./mutation-social";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";

interface Props {
  activityId: string;
}
const payload = getTokenPayload();

const userunit = payload?.nameUnit || "";
const apartmentUnit = payload?.apartment;

console.log("apartmentUnit", apartmentUnit);

const schema = object({
  iduser: string().required("Este campo es requerido"), // ✅
  activity: string().required("Este campo es requerido"),
  description: string().optional(),
  nameUnit: string().required("Este campo es requerido"), // ✅
  reservationDate: string().required("Este campo es requerido"),
  apartment: string().required("este campo es requerido"),
  created_at: string().required(), // ✅
});

type FormValues = InferType<typeof schema>;

export default function useForm({ activityId }: Props) {
  const mutation = useMutationSocial();
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      iduser: storedUserId ?? "",
      activity: activityId,
      nameUnit: userunit,
      apartment: apartmentUnit ?? "",
      created_at: new Date().toISOString(),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;
  const onSubmit = async (dataform: FormValues) => {
    console.log("Enviando formulario:", dataform);
    await mutation.mutateAsync(dataform);
  };

  return {
    register,
    onSubmit,
    setValue,
    handleSubmit,
    formState: { errors },
    isSuccess: mutation.isSuccess,
  };
}
