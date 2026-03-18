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
import { route } from "@/app/_domain/constants/routes";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

interface Props {
  holidayId: string;
  startDate: string;
  endDate: string;
  priceTotal: number;
  nights: number;
}

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

const bookingSchema = object({
  holidayId: string().required(),
  email: string().email("Email inválido").required(),
  passengers: yup
    .array()
    .of(passengerSchema)
    .min(1, "Debes agregar al menos un pasajero")
    .required(),
  startDate: string().required(),
  endDate: string().required(),
  night: string().required(),
  totalPrice: number().required(),
  nameMain: string().required(),
});

type BookingFormValues = InferType<typeof bookingSchema>;

export default function useBookingForm({
  holidayId,
  startDate,
  endDate,
  priceTotal,
  nights,
}: Props) {
  const bookingMutation = useBookingMutation();

  const storedUserId = useConjuntoStore((state) => state.userId);

  const methods = useFormHook<BookingFormValues>({
    mode: "all",
    resolver: yupResolver(bookingSchema),
    defaultValues: {
      holidayId,
      startDate,
      endDate,
      night: String(nights),
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

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = methods;

  const passengersFieldArray = useFieldArray({
    control,
    name: "passengers",
  });

  const onSubmit = handleSubmit((data) => {
    if (!storedUserId) {
      window.open(route.auth, "_blank");
      return;
    }

    if (!data?.email) {
      console.error("Email es obligatorio");
      return;
    }

    if (!data?.nameMain) {
      console.error("Nombre principal es obligatorio");
      return;
    }

    const payload: CreateBookingRequest = {
      ...data,
      email: data?.email,
      nameMain: data?.nameMain,
      night: data.night!,
      passengers: data?.passengers.map((p) => ({
        type: p.type as PassengerType,
        ageRange: p.ageRange as AgeRange,
        quantity: p.quantity,
      })),
    };

    bookingMutation.mutate(payload);
  });
  return {
    register,
    control,
    handleSubmit: onSubmit,
    setValue,
    watch,
    formState: { errors },
    passengersFieldArray,
    mutation: bookingMutation,
  };
}
