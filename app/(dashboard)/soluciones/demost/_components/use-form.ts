/* eslint-disable react-hooks/rules-of-hooks */
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { number, object, string } from "yup";

import {
  countryMap,
  phoneLengthByCountry,
} from "@/app/helpers/longitud-telefono";
import { useDemostrationMutation } from "./demo-mutation";

const schema = object({
  fullName: string().required("El nombre es obligatorio"),

  email: string().email("Email inválido").required("Email es obligatorio"),

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

  indicative: string().required("Indicativo es requerido"),

  nameUnit: string().required("La unidad es requerida"),

  quantityUnits: number()
    .typeError("Debe ser un número")
    .required("Cantidad de unidades es requerida")
    .min(10, "Debe ser mayor a 10"),

  message: string().optional(),
});

export type FormValues = {
  email?: string;
  message?: string;
  indicative?: string;
  nameUnit?: string;
  fullName?: string;
  phone?: string;
  quantityUnits?: number;
};

export function useFormDemostration() {
  const createMutation = useDemostrationMutation();

  const methods = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      indicative: "",
      nameUnit: "",
      quantityUnits: undefined,
      message: "",
    },
  });

  const { register, handleSubmit, formState } = methods;

  const onSubmit = async (data: FormValues) => {
    await createMutation.mutateAsync(data);
  };

  return {
    ...methods,
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,
    handleSubmit,
    onSubmit,
    register,
  };
}
