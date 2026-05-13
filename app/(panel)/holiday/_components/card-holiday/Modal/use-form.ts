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

import { RegisterRequest } from "@/app/(panel)/my-new-user/services/request/register";

import {
  countryMap,
  phoneLengthByCountry,
} from "@/app/helpers/longitud-telefono";

interface Props {
  holidayId: string;
  startDate: string;
  endDate: string;
  priceTotal: number;
  nights: number;
}

const validatePhoneByCountry = function (
  this: yup.TestContext,
  value?: string,
) {
  const { indicative } = this.parent as RegisterRequest;

  if (!indicative || !value) return true;

  const countryName = indicative.split("-")[1]?.trim()?.toUpperCase();

  const countryCode = countryMap[countryName ?? ""];
  const expectedLength = phoneLengthByCountry[countryCode ?? ""];

  if (!expectedLength) return true;

  return value.length === expectedLength;
};

const passengerSchema = object({
  type: yup
    .mixed<PassengerType>()
    .oneOf(Object.values(PassengerType), "Tipo inválido")
    .required(),

  quantity: number().min(1, "Cantidad mínima 1").required("Cantidad requerida"),

  ageRange: yup
    .mixed<AgeRange>()
    .oneOf(Object.values(AgeRange), "Rango inválido")
    .required(),
});

const guestInfoSchema = object({
  nameMain: string().trim().required("Nombre obligatorio"),

  documentNumber: string().trim().required("Documento obligatorio"),

  // opcionales porque niños/bebés no siempre tienen
  email: string().trim().email("Email inválido").nullable().optional(),

  indicative: string().trim().nullable().optional(),

  phone: string()
    .trim()
    .matches(/^[0-9]*$/, "Solo números")
    .test(
      "len",
      "Longitud inválida para el país seleccionado",
      validatePhoneByCountry,
    )
    .nullable()
    .optional(),
});

const bookingSchema = object({
  holidayId: string().required(),

  email: string().email("Email inválido").required("Email requerido"),

  phone: string()
    .required("Teléfono requerido")
    .matches(/^[0-9]+$/, "Solo números")
    .test(
      "len",
      "Longitud inválida para el país seleccionado",
      validatePhoneByCountry,
    ),

  indicative: string().required("Indicativo requerido"),

  documentNumber: string().required(),

  passengers: yup
    .array()
    .of(passengerSchema)
    .min(1, "Debes agregar pasajeros")
    .required(),

  guestsInfos: yup.array().of(guestInfoSchema).default([]),

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
    if (!storedUserId) {
      window.open(route.auth, "_blank");
      return;
    }

    // total huéspedes esperados
    const expectedGuests =
      (data.passengers || []).reduce((acc, p) => acc + (p.quantity || 0), 0) -
      1;

    // limpia huéspedes vacíos
    const validGuests =
      data.guestsInfos?.filter(
        (g) => g?.nameMain?.trim() && g?.documentNumber?.trim(),
      ) || [];

    if (validGuests.length !== expectedGuests) {
      alert(
        `Faltan huéspedes por completar (${validGuests.length}/${expectedGuests})`,
      );

      return;
    }

    const payload: CreateBookingRequest = {
      holidayId: data.holidayId,

      email: data.email,

      nameMain: data.nameMain,

      indicative: data.indicative,

      documentNumber: data.documentNumber,

      phone: data.phone,

      night: data.night,

      startDate: data.startDate,

      endDate: data.endDate,

      totalPrice: data.totalPrice,

      passengers: data.passengers.map((p) => ({
        type: p.type as PassengerType,
        ageRange: p.ageRange as AgeRange,
        quantity: p.quantity,
      })),

      guestsInfos: validGuests.map((g) => ({
        nameMain: g.nameMain.trim(),

        documentNumber: g.documentNumber.trim(),

        email: g.email?.trim() || "",

        indicative: g.indicative?.trim() || "",

        phone: g.phone?.trim() || "",
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

    guestsFieldArray,

    mutation: bookingMutation,
  };
}
