import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { number, object, string } from "yup";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useCreateStayMutation } from "./use-stay-mutation";
import {
  ExternalStayRequest,
  ExternalStayResponse,
} from "../services/externalStayService";

const schema = object({
  guestName: string().required("El nombre del huésped es obligatorio"),
  guestEmail: string()
    .email("Debe ser un correo válido")
    .required("El correo del huésped es obligatorio"),
  startDate: string().required("La fecha de inicio es obligatoria"),
  endDate: string()
    .required("La fecha de fin es obligatoria")
    .test(
      "after-start",
      "La fecha de fin debe ser posterior a la de inicio",
      function (value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;
        return new Date(value) > new Date(startDate);
      },
    ),
  guestsCount: number()
    .typeError("Debe ser un número")
    .integer("Debe ser un número entero")
    .min(1, "Debe ser al menos 1 huésped")
    .required("La cantidad de huéspedes es obligatoria"),
});

export type StayFormValues = {
  guestName?: string;
  guestEmail?: string;
  startDate?: string;
  endDate?: string;
  guestsCount?: number;
};

export function useStayForm(
  externalListingId: string,
  onCreated?: (stay: ExternalStayResponse) => void,
) {
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const createMutation = useCreateStayMutation(externalListingId);

  const methods = useForm<StayFormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      guestName: "",
      guestEmail: "",
      startDate: "",
      endDate: "",
      guestsCount: 1,
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      ...data,
      conjuntoId: String(idConjunto),
    } as ExternalStayRequest;

    const stay = await createMutation.mutateAsync(payload);
    reset();
    onCreated?.(stay);
  });

  return {
    ...methods,
    handleSubmit: onSubmit,
    isPending: createMutation.isPending,
  };
}
