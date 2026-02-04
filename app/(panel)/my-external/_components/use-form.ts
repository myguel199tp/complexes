/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { mixed, object, string } from "yup";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useExternalMutation } from "./use-external-mutation";
import { ExternalPlatform } from "../services/request/externaRequest";

/* -------------------- */
/* Schema Yup           */
/* -------------------- */
const schema = object({
  conjuntoId: string().required("El conjunto es obligatorio"),
  platform: mixed<ExternalPlatform>()
    .oneOf(Object.values(ExternalPlatform))
    .required("La plataforma es obligatoria"),
  listingUrl: string()
    .url("Debe ser una URL válida")
    .required("La URL del anuncio es obligatoria"),
  externalId: string().optional(),
  icalUrl: string().url("Debe ser una URL válida").optional(),
});

/* -------------------- */
/* Tipos del Formulario */
/* -------------------- */
export type FormValues = {
  conjuntoId: string; // 🔥 obligatorio (clave del error)
  platform: ExternalPlatform;
  listingUrl: string;
  externalId?: string;
  icalUrl?: string;
};

/* -------------------- */
/* Hook                 */
/* -------------------- */
export function useFormArea() {
  const createMutation = useExternalMutation();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  const methods = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      conjuntoId: "", // se setea luego desde el store
      platform: ExternalPlatform.AIRBNB,
      listingUrl: "",
      externalId: "",
      icalUrl: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  /* -------------------- */
  /* Sincroniza conjunto  */
  /* -------------------- */
  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [idConjunto, setValue]);

  /* -------------------- */
  /* Submit               */
  /* -------------------- */
  const onSubmit = handleSubmit(async (data) => {
    await createMutation.mutateAsync(data);
  });

  return {
    ...methods,
    register,
    handleSubmit: onSubmit,
    errors,
    isSubmitting,
  };
}
