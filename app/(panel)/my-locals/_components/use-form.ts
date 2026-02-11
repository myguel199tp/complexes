import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number, mixed } from "yup";
import { useEffect } from "react";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useMutationLocals } from "./mutationLocals";
import { LocalOperationType } from "../services/request/localsRequest";

/* =======================
   SCHEMA
======================= */
const schema = object({
  name: string().required("El nombre del local es obligatorio"),
  plaque: string().required("La placa del local es obligatoria"),
  kindOfBusiness: string().required("El tipo de negocio es obligatorio"),

  ownerName: string().required("El nombre del propietario es obligatorio"),
  ownerLastName: string().required(
    "El apellido del propietario es obligatorio",
  ),

  indicative: string().optional(),
  phone: string().required("El teléfono es obligatorio"),

  operationType: mixed<LocalOperationType>()
    .oneOf(Object.values(LocalOperationType))
    .required("El tipo de operación es obligatorio"),

  administrationFee: number()
    .typeError("Debe ser un número")
    .required("La administración es obligatoria"),

  rentValue: number()
    .typeError("Debe ser un número")
    .when("operationType", {
      is: LocalOperationType.RENT,
      then: (schema) => schema.required("El valor del arriendo es obligatorio"),
      otherwise: (schema) => schema.optional(),
    }),

  adminPrice: number()
    .typeError("Debe ser un número")
    .when("operationType", {
      is: LocalOperationType.SALE,
      then: (schema) => schema.required("El precio de venta es obligatorio"),
      otherwise: (schema) => schema.optional(),
    }),

  conjuntoId: string().required(),
});

/* =======================
   TYPES
======================= */
export type FormValues = {
  name: string;
  plaque: string;
  kindOfBusiness: string;

  ownerName: string;
  ownerLastName: string;

  indicative?: string;
  phone: string;

  operationType: LocalOperationType;

  administrationFee: number;
  rentValue?: number;
  adminPrice?: number;

  conjuntoId: string;
};

/* =======================
   HOOK
======================= */
export function useFormLocal() {
  const mutation = useMutationLocals();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  const methods = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      plaque: "",
      kindOfBusiness: "",
      ownerName: "",
      ownerLastName: "",
      indicative: "",
      phone: "",
      operationType: undefined as unknown as LocalOperationType,
      administrationFee: 0,
      rentValue: undefined,
      adminPrice: undefined,
      conjuntoId: idConjunto ?? "",
    },
  });

  const { handleSubmit, setValue, formState } = methods;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
  }, [idConjunto, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    await mutation.mutateAsync(data);
  });

  return {
    ...methods,
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,
    handleSubmit: onSubmit,
  };
}
