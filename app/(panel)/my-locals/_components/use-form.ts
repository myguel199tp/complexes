import { useForm, useWatch, FieldErrors } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InferType, object, string, number, mixed } from "yup";
import { useEffect } from "react";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useMutationLocals } from "./mutationLocals";
import {
  CreateLocalRequest,
  LocalOperationType,
} from "../services/request/localsRequest";

const localSchema = object({
  name: string().required("El nombre del local es obligatorio"),
  plaque: string().required("la placa de local es obligatorio"),
  kindOfBusiness: string().required("El tipo de negocio es obligatorio"),
  ownerName: string().required("El nombre del propietario es obligatorio"),
  ownerLastName: string().required(
    "El apellido del propietario es obligatorio"
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

  salePrice: number()
    .typeError("Debe ser un número")
    .when("operationType", {
      is: LocalOperationType.SALE,
      then: (schema) => schema.required("El precio de venta es obligatorio"),
      otherwise: (schema) => schema.optional(),
    }),

  conjuntoId: string().required(),
});

export type LocalFormValues = InferType<typeof localSchema>;

export function useFormLocal() {
  const mutation = useMutationLocals();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const methods = useForm<LocalFormValues>({
    resolver: yupResolver(localSchema),
    defaultValues: {
      name: "",
      plaque: "",
      kindOfBusiness: "",
      ownerName: "",
      ownerLastName: "",
      indicative: "",
      phone: "",
      operationType: undefined,
      administrationFee: undefined,
      rentValue: undefined,
      salePrice: undefined,
      conjuntoId: "",
    },
  });

  const { control, setValue, handleSubmit, formState } = methods;

  const operationType = useWatch({
    control,
    name: "operationType",
  });

  useEffect(() => {
    if (conjuntoId) {
      setValue("conjuntoId", String(conjuntoId));
    }
  }, [conjuntoId, setValue]);

  const onSubmit = handleSubmit(async (data: LocalFormValues) => {
    try {
      const payload: CreateLocalRequest = {
        name: data.name,
        plaque: data.plaque,
        kindOfBusiness: data.kindOfBusiness,
        ownerName: data.ownerName,
        ownerLastName: data.ownerLastName,
        indicative: data.indicative || undefined,
        phone: data.phone,

        operationType: data.operationType,

        administrationFee: Number(data.administrationFee),
        rentValue:
          data.operationType === LocalOperationType.RENT
            ? Number(data.rentValue)
            : undefined,
        salePrice:
          data.operationType === LocalOperationType.SALE
            ? Number(data.salePrice)
            : undefined,

        conjuntoId: data.conjuntoId,
      };

      await mutation.mutateAsync(payload);
    } catch (error) {
      console.error("❌ Error al crear local:", error);
    }
  });

  return {
    ...methods,
    control,
    onSubmit,
    operationType,
    isSubmitting: formState.isSubmitting,
    errors: formState.errors as FieldErrors<LocalFormValues>,
  };
}
