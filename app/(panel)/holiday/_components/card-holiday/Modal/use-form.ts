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

const guestInfoSchema = object({
  nameMain: string().required("Nombre obligatorio"),
  documentNumber: string().required("Documento obligatorio"),
  email: string().email("Email inválido").required(),
  indicative: string().required("Indicativo obligatorio"),
  phone: string().required("Teléfono obligatorio"),
});

const bookingSchema = object({
  holidayId: string().required(),
  email: string().email("Email inválido").required(),
  indicative: string().required(),
  documentNumber: string().required(),
  phone: string().required(),
  passengers: yup
    .array()
    .of(passengerSchema)
    .min(1, "Debes agregar al menos un pasajero")
    .required(),
  guestsInfos: yup.array().of(guestInfoSchema),
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

      guestsInfos: [],
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
  const guestsFieldArray = useFieldArray({
    control,
    name: "guestsInfos",
  });

  const onSubmit = handleSubmit((data) => {
    console.log("entro");

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

    const expectedGuests =
      (data.passengers || []).reduce((acc, p) => acc + (p.quantity || 0), 0) -
      1;

    if ((data.guestsInfos?.length || 0) !== expectedGuests) {
      console.error("Guests incompletos");
      return;
    }

    const payload: CreateBookingRequest = {
      ...data,
      email: data?.email,
      nameMain: data?.nameMain,
      indicative: data?.indicative,
      documentNumber: data?.documentNumber,
      phone: data?.phone,
      night: data.night!,
      passengers: data?.passengers.map((p) => ({
        type: p.type as PassengerType,
        ageRange: p.ageRange as AgeRange,
        quantity: p.quantity,
      })),
      guestsInfos: data.guestsInfos.map((g) => ({
        nameMain: g.nameMain,
        documentNumber: g.documentNumber,
        email: g.email,
        indicative: g.indicative,
        phone: g.phone,
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
    guestsFieldArray,
  };
}
