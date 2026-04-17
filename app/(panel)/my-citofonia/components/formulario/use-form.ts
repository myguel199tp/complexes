"use client";

import { boolean, InferType, mixed, object, string } from "yup";
import { useMutationVisit } from "./useVisitMutation";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useEffect } from "react";

export const schema = object({
  namevisit: string().required("Nombre es requerido"),
  numberId: string().required("Número de identificación es requerido"),
  userId: string(),
  visitType: string().required("Tipo de visitante requerido"),
  nameUnit: string().optional(),
  apartment: string().required("Número de casa o apartamento es requerida"),
  plaque: string().optional(),
  hasParking: boolean().optional(),
  photoUrl: string().optional(),
  documentPhotoUrl: string().optional(),
  parkingRatePerHour: string().optional(),
  file: mixed<File>()
    .nullable()
    .required("La foto es obligatoria")
    .test(
      "fileSize",
      "El archivo es demasiado grande (máx 5MB)",
      (value) => !value || value.size <= 5_000_000,
    )
    .test(
      "fileType",
      "Solo se permiten imágenes JPG o PNG",
      (value) => !value || ["image/jpeg", "image/png"].includes(value.type),
    ),
  conjuntoId: string().required(),
});

export type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationVisit();
  const { data } = useEnsembleInfo();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const userunit = data?.[0]?.conjunto.name || "";

  const methods = useFormHook<FormValues>({
    mode: "onSubmit",
    resolver: yupResolver(schema),
    defaultValues: {
      nameUnit: userunit,
      conjuntoId: idConjunto ? String(idConjunto) : "",
    },
  });

  const { register, handleSubmit, setValue, formState, control } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }

    if (userunit) {
      setValue("nameUnit", userunit);
    }
  }, [idConjunto, userunit, setValue]);

  const onSubmit = handleSubmit(
    async (dataform) => {
      console.log("✅ SUBMIT OK", dataform);
      const formData = new FormData();

      formData.append("namevisit", dataform.namevisit);
      formData.append("numberId", dataform.numberId);
      formData.append("userId", dataform.userId);
      formData.append("visitType", dataform.visitType);
      formData.append("nameUnit", dataform.nameUnit ?? "");
      formData.append("apartment", dataform.apartment);
      formData.append("plaque", dataform.plaque ?? "");
      formData.append("hasParking", String(dataform.hasParking ?? false));
      formData.append("parkingRatePerHour", dataform.parkingRatePerHour ?? "0");
      formData.append("photoUrl", dataform.photoUrl ?? "");
      formData.append("documentPhotoUrl", dataform.documentPhotoUrl ?? "");
      formData.append("conjuntoId", dataform.conjuntoId);

      if (dataform.file instanceof File) {
        formData.append("file", dataform.file);
      }

      await mutation.mutateAsync(formData);
    },
    (errors) => {
      console.log("❌ ERRORES FORM", errors);
    },
  );

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    errors,
    control,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
  };
}
