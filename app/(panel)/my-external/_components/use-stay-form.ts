import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { number, object, string } from "yup";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useCreateStayMutation } from "./use-stay-mutation";
import { useBusyDates } from "./use-stay-query";
import {
  ExternalStayRequest,
  ExternalStayResponse,
} from "../services/externalStayService";

/**
 * Noches del rango semiabierto `[entrada, salida)`, en "yyyy-MM-dd". Mismo
 * criterio que el backend: la noche de salida no se ocupa.
 *
 * Se cuenta en UTC a propósito; construir las fechas en hora local corría un
 * día al cruzar el cambio de mes en zonas al oeste de UTC.
 */
function nightsBetween(startDate: string, endDate: string) {
  const nights: string[] = [];
  const current = new Date(`${startDate.slice(0, 10)}T00:00:00Z`);
  const last = new Date(`${endDate.slice(0, 10)}T00:00:00Z`);

  if (isNaN(current.getTime()) || isNaN(last.getTime())) return nights;

  while (current < last) {
    nights.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return nights;
}

/**
 * El calendario ya no deja escoger un día ocupado, pero el campo también se
 * puede teclear a mano, y el rango completo puede saltarse por encima de una
 * noche ocupada aunque sus extremos estén libres.
 */
function buildSchema(busyDates: string[]) {
  const busy = new Set(busyDates);

  return object({
    guestName: string().required("El nombre del huésped es obligatorio"),
    guestEmail: string()
      .email("Debe ser un correo válido")
      .required("El correo del huésped es obligatorio"),
    startDate: string()
      .required("La fecha de inicio es obligatoria")
      .test(
        "start-free",
        "Ese día ya está ocupado en este inmueble",
        (value) => !value || !busy.has(value.slice(0, 10)),
      ),
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
      )
      .test(
        "range-free",
        "El rango incluye noches ya ocupadas en este inmueble",
        function (value) {
          const { startDate } = this.parent;
          if (!startDate || !value) return true;
          return !nightsBetween(startDate, value).some((night) =>
            busy.has(night),
          );
        },
      ),
    guestsCount: number()
      .typeError("Debe ser un número")
      .integer("Debe ser un número entero")
      .min(1, "Debe ser al menos 1 huésped")
      .required("La cantidad de huéspedes es obligatoria"),
  });
}

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
  const { data: busyDates } = useBusyDates(externalListingId);

  const busy = useMemo(() => busyDates ?? [], [busyDates]);

  const methods = useForm<StayFormValues>({
    mode: "all",
    resolver: yupResolver(buildSchema(busy)),
    defaultValues: {
      guestName: "",
      guestEmail: "",
      startDate: "",
      endDate: "",
      guestsCount: 1,
    },
  });

  const { handleSubmit, reset, watch } = methods;
  const startDate = watch("startDate");

  /**
   * Hasta dónde puede llegar la salida: la primera noche ocupada a partir de
   * la entrada. Se permite salir *ese mismo día* porque esa noche ya no es
   * nuestra, y así una estadía puede terminar justo donde arranca la siguiente.
   */
  const maxEndDate = useMemo(() => {
    if (!startDate) return undefined;

    const next = busy
      .filter((date) => date > startDate.slice(0, 10))
      .sort()[0];

    return next ? new Date(`${next}T00:00:00`) : undefined;
  }, [busy, startDate]);

  const minEndDate = useMemo(() => {
    if (!startDate) return undefined;

    const day = new Date(`${startDate.slice(0, 10)}T00:00:00`);
    if (isNaN(day.getTime())) return undefined;

    day.setDate(day.getDate() + 1);
    return day;
  }, [startDate]);

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
    busyDates: busy,
    minEndDate,
    maxEndDate,
  };
}
