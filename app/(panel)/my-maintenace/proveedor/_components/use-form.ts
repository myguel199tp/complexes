/* eslint-disable react-hooks/rules-of-hooks */
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import { useEffect } from "react";

import { useProviderMutation } from "./proveedor-mutation";
import {
  countryMap,
  phoneLengthByCountry,
} from "@/app/helpers/longitud-telefono";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const schema = object({
  conjuntoId: string(),
  name: string().required("La zona común es obligatoria"),
  service: string().required("El proveedor es obligatorio"),
  phone: string()
    .required("Teléfono es requerido")
    .matches(/^[0-9]+$/, "Solo se permiten números")
    .test(
      "len",
      "Longitud inválida para el país seleccionado",
      function (value) {
        const { indicative } = this.parent;
        if (!indicative || !value) return true;

        const countryName = indicative.split("-")[1]?.trim()?.toUpperCase();
        const countryCode = countryMap[countryName];
        const expectedLength = phoneLengthByCountry[countryCode ?? ""];

        if (!expectedLength) return true;
        return value.length === expectedLength;
      },
    ),
  indicative: string().required("indicativo es requerido"),
  email: string().defined(),
});

/**
 * Tipo inferido
 */
export type FormValues = {
  conjuntoId?: string;
  name: string;
  service: string;
  phone: string;
  indicative: string;
  email: string;
};

export function useFormProvider() {
  const createMutation = useProviderMutation();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  const methods = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      conjuntoId: idConjunto || "",
      name: "",
      service: "",
      indicative: "",
      phone: "",
      email: "",
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
  }, [idConjunto, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    await createMutation.mutateAsync(data);
  });

  return {
    ...methods,
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,
    handleSubmit: onSubmit,
    register,
  };
}
