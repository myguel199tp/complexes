"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, useFieldArray } from "react-hook-form";
import * as yup from "yup";
import { object, string, InferType, number } from "yup";
import {
  AgeRange,
  CreateBookingRequest,
  PassengerType,
} from "../../../services/request/bookingRequest";
import { useBookingMutation } from "./bookingMutation";

interface Props {
  holidayId: string;
  startDate: string;
  endDate: string;
  priceTotal: number;
}

// Schema Yup para pasajeros
const passengerSchema = object({
  type: yup
    .mixed<PassengerType>()
    .oneOf(Object.values(PassengerType), "Tipo inválido")
    .required(),
  quantity: number().min(1, "Cantidad mínima 1").required(),
  ageRange: yup
    .mixed<AgeRange>()
    .oneOf(Object.values(AgeRange), "Rango de edad inválido")
    .required(),
});

// Schema Yup para el booking completo
const bookingSchema = object({
  holidayId: string(),
  email: string().email("Email inválido").required(),
  passengers: yup
    .array()
    .of(passengerSchema)
    .min(1, "Debes agregar al menos un pasajero"),
  startDate: string(),
  endDate: string(),
  totalPrice: number(),
  nameMain: string().required(),
});

// Tipado del formulario
type BookingFormValues = InferType<typeof bookingSchema>;

// Hook personalizado
export default function useBookingForm({
  holidayId,
  startDate,
  endDate,
  priceTotal,
}: Props) {
  const bookingMutation = useBookingMutation();

  const methods = useFormHook<BookingFormValues>({
    mode: "all",
    resolver: yupResolver(bookingSchema),
    defaultValues: {
      holidayId: holidayId,
      startDate: startDate,
      endDate: endDate,
      totalPrice: priceTotal,
      passengers: [
        {
          type: PassengerType.MAYOR,
          quantity: 1,
          ageRange: AgeRange.MAYOR,
        },
      ],
    },
  });

  const { register, control, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  // Manejo de array dinámico de pasajeros
  const passengersFieldArray = useFieldArray({
    control,
    name: "passengers",
  });

  // Función submit: transforma strings a enums antes de enviar
  const onSubmit = handleSubmit((data) => {
    const payload: CreateBookingRequest = {
      ...data,
      passengers: data.passengers!.map((p) => ({
        ...p,
        type: p.type as PassengerType,
        ageRange: p.ageRange as AgeRange,
      })),
    };

    bookingMutation.mutate(payload);
  });

  return {
    register,
    control,
    handleSubmit: onSubmit,
    setValue,
    formState: { errors },
    passengersFieldArray,
    mutation: bookingMutation, // para manejar loading/error en el UI
  };
}
