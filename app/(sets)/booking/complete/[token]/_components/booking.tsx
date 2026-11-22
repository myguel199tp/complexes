/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Title,
  Text,
} from "complexes-next-components";
import { ShieldCheck, CalendarDays, Users, CreditCard } from "lucide-react";
import { ImSpinner9 } from "react-icons/im";

import { useConfirmBooking } from "./useConfirmBooking";
import {
  getCompletionSummary,
  syncBookingPayment,
} from "../service/bookingService";
import {
  BookingCompletionSummary,
  BookingPaymentSync,
} from "../service/request/bokkingRequest";
import { Button, InputField, SelectField } from "@/app/components/ui/form";
import { route } from "@/app/_domain/constants/routes";

// `YYYY-MM-DD` al mediodía: a medianoche UTC en Colombia cae el día anterior.
const formatDay = (day?: string | null) =>
  day ? new Date(`${day}T12:00:00`).toLocaleDateString("es-CO") : "-";

/** Estados de Mercado Pago que todavía pueden terminar aprobados (PSE). */
const PAYMENT_IN_FLIGHT = ["pending", "in_process", "authorized"];
const PAYMENT_POLL_MS = 5000;
/** Unos dos minutos preguntando; después se avisa por correo. */
const PAYMENT_POLL_MAX = 24;
/** Mercado Pago puede tardar unos segundos en mostrar un pago recién hecho. */
const PAYMENT_NOT_FOUND_RETRIES = 3;

export enum PassengerDocument {
  CEDULA = "CC",
  PASAPORTE = "PASSPORT",
}

export const PASSENGER_DOCUMENT_LABELS: Record<PassengerDocument, string> = {
  [PassengerDocument.CEDULA]: "Cédula",
  [PassengerDocument.PASAPORTE]: "Pasaporte",
};

export default function BookingComplete() {
  const params = useParams();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  const [documentType, setDocumentType] = useState<PassengerDocument>(
    PassengerDocument.CEDULA,
  );

  const [documentNumber, setDocumentNumber] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const { mutate, isPending } = useConfirmBooking();

  const { data: summary, isLoading } = useQuery<BookingCompletionSummary>({
    queryKey: ["booking-completion", token],
    queryFn: () => getCompletionSummary(String(token)),
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Vuelta desde Mercado Pago: `?pago=aprobado|pendiente|rechazado`. Lo que
  // vale no es ese parámetro sino lo que el backend lee en Mercado Pago.
  const searchParams = useSearchParams();
  const returnedAs = searchParams.get("pago");
  const queryClient = useQueryClient();
  const [paymentChecks, setPaymentChecks] = useState(0);

  const isStillPaying = (data?: BookingPaymentSync) =>
    !!data &&
    data.estado === "pending" &&
    (data.pago === "approved" ||
      PAYMENT_IN_FLIGHT.includes(data.pago ?? "") ||
      (data.pago === null &&
        returnedAs !== "rechazado" &&
        paymentChecks < PAYMENT_NOT_FOUND_RETRIES));

  const {
    data: payment,
    isLoading: paymentLoading,
    error: paymentError,
  } = useQuery<BookingPaymentSync, Error>({
    queryKey: ["booking-payment-sync", token],
    queryFn: async () => {
      setPaymentChecks((n) => n + 1);
      const result = await syncBookingPayment(String(token));
      if (result.estado && result.estado !== "pending") {
        await queryClient.invalidateQueries(["booking-completion", token]);
      }
      return result;
    },
    enabled: !!token && !!returnedAs && summary?.estado === "pending",
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: (data) =>
      isStillPaying(data) && paymentChecks < PAYMENT_POLL_MAX
        ? PAYMENT_POLL_MS
        : false,
  });

  const payOnline = summary?.pago?.cobro === "mercadopago";
  const checkingPayment =
    !!returnedAs &&
    summary?.estado === "pending" &&
    !paymentError &&
    (paymentLoading ||
      (isStillPaying(payment) && paymentChecks < PAYMENT_POLL_MAX));
  // Se acabó el tiempo de preguntar y Mercado Pago sigue procesando (PSE):
  // no se muestra el formulario para no cobrar dos veces.
  const paymentStillInFlight =
    !checkingPayment &&
    !!payment &&
    payment.estado === "pending" &&
    (payment.pago === "approved" ||
      PAYMENT_IN_FLIGHT.includes(payment.pago ?? ""));
  const paymentFailed =
    !!returnedAs &&
    !checkingPayment &&
    !paymentStillInFlight &&
    summary?.estado === "pending";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ImSpinner9 className="animate-spin text-cyan-500" size={40} />
      </div>
    );
  }

  // Ya confirmada (doble clic, volver atrás) o vencida/cancelada: no hay
  // formulario que llenar, solo a dónde ir.
  if (summary && summary.estado !== "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-2xl">
          <Title as="h2" size="xs" font="bold" className="mb-2">
            {summary.estado === "confirmed"
              ? returnedAs
                ? "¡Pago aprobado! Tu reserva está confirmada"
                : "Esta reserva ya está confirmada"
              : "Esta reserva ya no se puede confirmar"}
          </Title>
          <Text className="mb-4 text-sm">
            {summary.estado === "confirmed"
              ? "Encuentras el código de portería y los detalles en tus reservas."
              : summary.pago?.estado === "refunded"
                ? "Tu pago llegó cuando la reserva ya no estaba vigente: Mercado Pago te lo devuelve completo."
                : "Las noches se liberaron. Puedes volver a reservar las fechas."}
          </Text>
          <Link href={route.myvacations} className="text-sm font-semibold underline">
            Ir a mis reservas
          </Link>
        </div>
      </div>
    );
  }

  // Recién vuelto de Mercado Pago: se espera a que el pago se apruebe.
  if (summary && (checkingPayment || paymentStillInFlight)) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-2xl">
          {checkingPayment && (
            <ImSpinner9
              className="mx-auto mb-4 animate-spin text-cyan-500"
              size={36}
            />
          )}
          <Title as="h2" size="xs" font="bold" className="mb-2">
            {checkingPayment
              ? "Estamos confirmando tu pago"
              : "Tu pago sigue en proceso"}
          </Title>
          <Text className="mb-4 text-sm">
            {checkingPayment
              ? "No cierres esta página: en cuanto Mercado Pago apruebe el pago, la reserva queda confirmada."
              : "Mercado Pago todavía no lo aprueba (pasa con PSE). Te avisamos por correo apenas quede confirmada; no hace falta pagar otra vez."}
          </Text>
          {!checkingPayment && (
            <Link
              href={route.myvacations}
              className="text-sm font-semibold underline"
            >
              Ir a mis reservas
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div
          className="
            w-full
            max-w-md
            rounded-[28px]
            border
            border-white/10
            bg-white/5
            p-8
            text-center
            backdrop-blur-2xl
          "
        >
          <div
            className="
              mx-auto
              mb-4
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-red-500/10
            "
          >
            <ShieldCheck className="h-8 w-8 text-red-400" />
          </div>

          <Title as="h2" size="xs" font="bold" className="mb-2">
            Enlace inválido
          </Title>

          <Text className="text-sm /60">El enlace expiró o no es válido.</Text>
        </div>
      </div>
    );
  }

  const disabled =
    !documentNumber ||
    !emergencyContactName ||
    !emergencyContactPhone ||
    !acceptTerms;

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        px-4
        py-10
      "
    >
      {/* GLOW BACKGROUNDS */}
      <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* LEFT SIDE */}
          <div
            className="
              rounded-[32px]
              border
              border-white/10
              bg-white/5
              p-8
              backdrop-blur-2xl
            "
          >
            {/* HEADER */}
            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/10
                  p-2
                "
              >
                <Avatar
                  src="/complex.png"
                  alt="complexes"
                  size="lg"
                  border="none"
                  shape="rounded"
                />
              </div>

              <div>
                <Text className="text-sm text-cyan-800">
                  Reserva segura y verificada
                </Text>

                <Title size="sm" font="bold">
                  Completa tu reserva
                </Title>
              </div>
            </div>

            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();

                mutate({
                  token,

                  documentType,

                  documentNumber,

                  emergencyContactName,

                  emergencyContactPhone,

                  acceptTerms,
                });
              }}
            >
              {paymentFailed && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                  <Text size="sm" font="semi">
                    {paymentError
                      ? "No pudimos consultar tu pago"
                      : "El pago no se completó"}
                  </Text>
                  <Text size="sm" className="mt-1">
                    {paymentError
                      ? paymentError.message
                      : "Mercado Pago no aprobó el pago o no se terminó. Puedes intentarlo de nuevo con otro medio; no se te cobró nada."}
                  </Text>
                </div>
              )}

              {/* DOCUMENTO */}
              <div
                className="
                  rounded-3xl
                  border
                  border-black/10
                  bg-black/[0.03]
                  p-6
                "
              >
                <div className="mb-5">
                  <Title as="h3" size="sm" font="semi">
                    Documento de identidad
                  </Title>

                  <Text size="sm">
                    Verificamos tu identidad para proteger la reserva.
                  </Text>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectField
                    value={documentType}
                    inputSize="md"
                    helpText="Cedula"
                    options={Object.values(PassengerDocument).map((doc) => ({
                      value: doc,
                      label: PASSENGER_DOCUMENT_LABELS[doc],
                    }))}
                    onChange={(e) =>
                      setDocumentType(e.target.value as PassengerDocument)
                    }
                  />

                  <InputField
                    regexType="alphanumeric"
                    placeholder="Número de documento"
                    helpText="Número de documento"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* CONTACTO */}
              <div
                className="
                  rounded-3xl
                  border
                  border-black/10
                  bg-black/[0.03]
                  p-6
                "
              >
                <div className="mb-5">
                  <Title size="sm" font="semi">
                    Contacto de emergencia
                  </Title>

                  <Text size="sm">
                    Persona a contactar en caso de emergencia.
                  </Text>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    regexType="letters"
                    placeholder="Nombre completo"
                    helpText="Nombre completo"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                  />

                  <InputField
                    regexType="phone"
                    placeholder="Teléfono"
                    helpText="Teléfono"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* TERMINOS */}
              <div
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-black/10
                  bg-black/[0.03]
                "
              >
                <button
                  type="button"
                  onClick={() => setShowTerms(!showTerms)}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    px-6
                    py-5
                    transition
                    hover:bg-white/5
                  "
                >
                  <div>
                    <Text size="sm">Términos y condiciones</Text>

                    <Text size="sm">
                      Información importante antes de continuar
                    </Text>
                  </div>

                  <div
                    className="
                      rounded-full
                      border
                      border-white/10
                      bg-white/5
                      px-4
                      py-2
                      text-sm
                      text-cyan-800
                    "
                  >
                    {showTerms ? "Cerrar" : "Ver"}
                  </div>
                </button>

                {showTerms && (
                  <div
                    className="
                      max-h-72
                      overflow-y-auto
                      border-t
                      border-white/10
                      px-6
                      py-5
                      text-sm
                      leading-relaxed
                    "
                  >
                    <div className="space-y-4">
                      <Text>
                        Al confirmar esta reserva aceptas los términos y
                        condiciones del alojamiento.
                      </Text>

                      <div>
                        <Text className="font-semibold ">1. Servicio</Text>

                        <Text>
                          La plataforma conecta huéspedes con alojamientos
                          verificados.
                        </Text>
                      </div>

                      <div>
                        <Text className="font-semibold ">2. Pagos</Text>

                        <Text>
                          {payOnline
                            ? "El pago total se hace con Mercado Pago y va directo a la cuenta del anfitrión. La reserva queda confirmada cuando el pago se aprueba. Las devoluciones por cancelación salen por el mismo medio de pago."
                            : "El huésped se compromete a realizar el pago total indicado."}
                        </Text>
                      </div>

                      <div>
                        <Text className="font-semibold ">
                          3. Protección de datos
                        </Text>

                        <Text>
                          La información será utilizada únicamente para
                          gestionar la reserva.
                        </Text>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-white/10 px-6 py-5">
                  <label className="flex items-center gap-3 text-sm /80">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="
                        h-4
                        w-4
                        rounded
                        border-white/20
                        bg-transparent
                      "
                    />
                    Acepto los términos y condiciones
                  </label>
                </div>
              </div>

              {/* BUTTON */}
              <Button
                type="submit"
                colVariant="success"
                size="full"
                disabled={disabled || isPending}
              >
                {payOnline
                  ? isPending
                    ? "Llevándote a Mercado Pago..."
                    : "Continuar al pago"
                  : isPending
                    ? "Confirmando reserva..."
                    : "Confirmar reserva"}
              </Button>

              <Text className="text-center text-xs /40">
                🔒 Información protegida y cifrada
              </Text>
            </form>
          </div>

          {/* RIGHT SIDE */}
          <div
            className="
              h-fit
              rounded-[32px]
              border
              border-cyan-500/20
              bg-gradient-to-b
              from-cyan-500/10
              to-blue-600/10
              p-7
              backdrop-blur-2xl
            "
          >
            <div className="mb-6">
              <Text className=" text-cyan-800" font="bold">
                Resumen de reserva
              </Text>

              <Title as="h2" size="xs" font="bold" className="mt-2">
                Tu estancia
              </Title>
            </div>

            <div className="space-y-4">
              <div
                className="
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  p-4
                "
              >
                <div
                  className="
                    rounded-xl
                    bg-cyan-500/10
                    p-3
                  "
                >
                  <Users className="h-5 w-5 text-cyan-300" />
                </div>

                <div>
                  <Text className="text-xs /50">Huésped principal</Text>

                  <Text className="font-medium ">{summary.nombre}</Text>
                </div>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  p-4
                "
              >
                <div
                  className="
                    rounded-xl
                    bg-blue-500/10
                    p-3
                  "
                >
                  <CalendarDays className="h-5 w-5 text-blue-300" />
                </div>

                <div>
                  <Text className="text-xs /50">Fechas</Text>

                  <Text className="font-medium ">
                    {formatDay(summary.entrada)} - {formatDay(summary.salida)}
                  </Text>
                </div>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  p-4
                "
              >
                <div
                  className="
                    rounded-xl
                    bg-emerald-500/10
                    p-3
                  "
                >
                  <CreditCard className="h-5 w-5 text-emerald-300" />
                </div>

                <div>
                  <Text className="text-xs /50">Total</Text>

                  <Text className="text-2xl font-bold ">
                    ${Math.round(summary.total).toLocaleString("es-CO")}
                  </Text>
                  <Text className="mt-1 text-xs opacity-70">
                    Cancelación {summary.politicaCancelacion.nombre.toLowerCase()}:{" "}
                    {summary.politicaCancelacion.descripcion}
                  </Text>
                </div>
              </div>
            </div>

            <div
              className="
                mt-6
                rounded-2xl
                border
                border-cyan-500/20
                bg-cyan-500/10
                p-5
              "
            >
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-300" />

                <div>
                  <Text className="font-medium ">Reserva protegida</Text>

                  <Text className="mt-1 text-sm /60">
                    Tus datos y pagos están protegidos mediante conexión segura.
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
