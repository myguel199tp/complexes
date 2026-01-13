import { InferType, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationSocial } from "./mutation-social";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";
import { useEffect } from "react";

interface Props {
  activityId: string;
}

const payload = getTokenPayload();

const schema = object({
  iduser: string().required("Este campo es requerido"),
  activity: string().required("Este campo es requerido"),
  description: string().optional(),
  nameUnit: string().required("Este campo es requerido"),
  reservationDate: string().required("Este campo es requerido"),
  apartment: string().required("este campo es requerido"),
  conjuntoId: string().required("El conjunto es obligatorio"),
});

type FormValues = InferType<typeof schema>;

export function useForm({ activityId }: Props) {
  const mutation = useMutationSocial();
  const { data } = useEnsembleInfo();

  const storedUserId = typeof window !== "undefined" ? payload?.id : null;
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const userunit = data?.[0]?.conjunto.name || "";
  const apartmentUnit = data?.[0]?.apartment || "";

  const methods = useFormHook<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      iduser: storedUserId ?? "",
      activity: activityId ?? "",
      nameUnit: userunit ?? "",
      apartment: apartmentUnit ?? "",
      conjuntoId: String(idConjunto),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
    if (userunit) {
      setValue("nameUnit", String(userunit));
    }
    if (apartmentUnit) {
      setValue("apartment", String(apartmentUnit));
    }
  }, [idConjunto, userunit, setValue, apartmentUnit]);

  const onSubmit = handleSubmit(async (dataform) => {
    // 🚀 Simplemente enviamos el objeto validado
    await mutation.mutateAsync({
      ...dataform,
    });
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    formState: { errors },
    isSuccess: mutation.isSuccess,
  };
}
