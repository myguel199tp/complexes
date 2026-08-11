"use client";

import { boolean, InferType, mixed, object, string } from "yup";
import { useMutationVisit } from "./useVisitMutation";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useEffect } from "react";
import { useParkingRate } from "./useParkingRate";
import { useVisitorSpots } from "./useVisitorSpots";

export const schema = object({
  namevisit: string().required("Nombre es requerido"),
  numberId: string().required("Número de identificación es requerido"),
  // `userId` ya no se manda: el backend resuelve el residente destinatario a
  // partir del apartamento. El portero lo dejaba vacío y la visita quedaba sin
  // dueño, así que nadie recibía la notificación.
  visitType: string().required("Tipo de visitante requerido"),
  nameUnit: string().optional(),
  apartment: string().required("Número de casa o apartamento es requerida"),
  plaque: string().optional(),
  hasParking: boolean().optional(),
  /**
   * Celda de visitantes. No se declara `required` en el esquema porque la
   * obligatoriedad depende de que el conjunto tenga alguna libre, un dato que no
   * vive en el formulario; se valida en el submit.
   */
  parkingSpotId: string().optional(),
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
  conjuntoId: string(),
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

  const { register, handleSubmit, setValue, watch, formState, control } =
    methods;
  const { errors } = formState;

  // Tarifa por hora configurada en cuotas (/my-fees/feesall).
  const { parkingRate } = useParkingRate();
  const parkingRateLocked = parkingRate != null;

  /**
   * El cobro es por vehículo: la placa es lo que prueba que lo hubo. El backend
   * rechaza `hasParking` sin placa, así que el formulario no deja llegar ahí.
   */
  const hasPlaque = Boolean(watch("plaque")?.trim());
  const chargesParking = hasPlaque && Boolean(watch("hasParking"));

  // El selector de celda solo se consulta cuando de verdad entra un vehículo.
  const visitorSpots = useVisitorSpots(chargesParking);

  useEffect(() => {
    if (!hasPlaque) {
      setValue("hasParking", false);
    }
  }, [hasPlaque, setValue]);

  // Si se desmarca el parqueadero, la celda elegida deja de tener sentido.
  useEffect(() => {
    if (!chargesParking) {
      setValue("parkingSpotId", "");
    }
  }, [chargesParking, setValue]);

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }

    if (userunit) {
      setValue("nameUnit", userunit);
    }
  }, [idConjunto, userunit, setValue]);

  // Autollenar el valor por hora desde la configuración de cuotas.
  useEffect(() => {
    if (parkingRate != null) {
      setValue("parkingRatePerHour", String(parkingRate));
    }
  }, [parkingRate, setValue]);

  const onSubmit = handleSubmit(
    async (dataform) => {
      const formData = new FormData();

      formData.append("namevisit", dataform.namevisit);
      formData.append("numberId", dataform.numberId);
      formData.append("visitType", dataform.visitType);
      formData.append("nameUnit", dataform.nameUnit ?? "");
      formData.append("apartment", dataform.apartment);
      const plaque = dataform.plaque?.trim() ?? "";
      // Sin placa no hay vehículo, y sin vehículo no hay cobro.
      const charges = Boolean(plaque) && Boolean(dataform.hasParking);

      formData.append("plaque", plaque);
      formData.append("hasParking", String(charges));

      if (charges) {
        formData.append(
          "parkingRatePerHour",
          dataform.parkingRatePerHour ?? "0",
        );

        /**
         * La celda es obligatoria mientras quede alguna libre: si se omite, el
         * backend responde 400 y el contador de cupos vuelve a ser una resta a
         * ciegas. Cuando no queda ninguna, se manda vacía a propósito y el
         * servidor la registra como sobrecupo.
         */
        if (dataform.parkingSpotId) {
          formData.append("parkingSpotId", dataform.parkingSpotId);
        } else if (visitorSpots.spots.length > 0) {
          methods.setError("parkingSpotId", {
            message: "Selecciona la celda donde queda el vehículo",
          });
          return;
        }
      }
      formData.append("photoUrl", dataform.photoUrl ?? "");
      formData.append("documentPhotoUrl", dataform.documentPhotoUrl ?? "");
      formData.append("conjuntoId", dataform.conjuntoId);

      if (dataform.file instanceof File) {
        formData.append("file", dataform.file);
      }

      await mutation.mutateAsync(formData);
    },
    (errors) => {
      console.error("❌ ERRORES FORM", errors);
    },
  );

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    errors,
    control,
    parkingRateLocked,
    hasPlaque,
    chargesParking,
    visitorSpots,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
  };
}
