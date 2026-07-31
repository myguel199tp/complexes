import { number, object, ObjectSchema, string } from "yup";
import { Resolver, useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationSocial } from "./mutation-social";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";
import { useEffect } from "react";
import { SocialRequest } from "../../services/request/socialRequest";

interface Props {
  activityId: string;
}

const schema: ObjectSchema<SocialRequest> = object({
  iduser: string().required("Este campo es requerido"),
  activity: string().required("Este campo es requerido"),
  description: string().optional(),
  reservation_date: string().required("Este campo es requerido"),
  apartment: string().required("este campo es requerido"),
  adultsCount: number()
    .typeError("Indica cuántos adultos asisten")
    .required("Indica cuántos adultos asisten")
    .min(0, "No puede ser negativo")
    // El backend aplica la misma regla; se valida aquí para avisar antes
    .test(
      "adultRequiredWithMinors",
      "Los menores deben ir con al menos un adulto",
      function (value) {
        const { minorsCount } = this.parent as { minorsCount?: number };

        if (!minorsCount) return true;

        return (value ?? 0) >= 1;
      },
    )
    .test("atLeastOnePerson", "La reserva debe incluir al menos una persona",
      function (value) {
        const { minorsCount } = this.parent as { minorsCount?: number };

        return (value ?? 0) + (minorsCount ?? 0) >= 1;
      },
    ),
  minorsCount: number()
    .typeError("Indica cuántos menores asisten")
    .required("Indica cuántos menores asisten")
    .min(0, "No puede ser negativo"),
  conjuntoId: string().required("El conjunto es obligatorio"),
});

export function useForm({ activityId }: Props) {
  const mutation = useMutationSocial();
  const { data } = useEnsembleInfo();

  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const apartmentUnit = data?.[0]?.apartment || "";
  const storedUserId = useConjuntoStore((state) => state.userId);

  const methods = useFormHook<SocialRequest>({
    resolver: yupResolver(schema) as Resolver<SocialRequest>,
    defaultValues: {
      iduser: storedUserId ?? "",
      activity: activityId ?? "",
      apartment: apartmentUnit ?? "",
      adultsCount: 1,
      minorsCount: 0,
      conjuntoId: String(idConjunto),
    },
  });

  const { register, handleSubmit, setValue, watch, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
    if (apartmentUnit) {
      setValue("apartment", String(apartmentUnit));
    }
  }, [idConjunto, setValue, apartmentUnit]);

  const onSubmit = handleSubmit(async (dataform) => {
    await mutation.mutateAsync({
      ...dataform,
    });
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    watch,
    formState: { errors },
    isSuccess: mutation.isSuccess,
  };
}
