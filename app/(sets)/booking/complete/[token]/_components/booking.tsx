/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {
  Avatar,
  InputField,
  SelectField,
  Title,
  Text,
  Button,
} from "complexes-next-components";
import { ShieldCheck, CalendarDays, Users, CreditCard } from "lucide-react";

import { useConfirmBooking } from "./useConfirmBooking";
import { BookingTokenPayload } from "../service/request/bokkingRequest";

export enum PassengerDocument {
  CEDULA = "CC",
  PASAPORTE = "PASSPORT",
}

export const PASSENGER_DOCUMENT_LABELS: Record<PassengerDocument, string> = {
  [PassengerDocument.CEDULA]: "Cédula",
  [PassengerDocument.PASAPORTE]: "Pasaporte",
};

export default function BookingComplete() {
  const { token } = useParams<{ token: string }>();

  const [documentType, setDocumentType] = useState<PassengerDocument>(
    PassengerDocument.CEDULA,
  );

  const [documentNumber, setDocumentNumber] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const { mutate, isPending } = useConfirmBooking();

  const decoded = useMemo(() => {
    try {
      return jwtDecode<BookingTokenPayload>(token);
    } catch {
      return null;
    }
  }, [token]);

  if (!decoded) {
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

          <h2 className="mb-2 text-2xl font-bold ">Enlace inválido</h2>

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
                  src="/complex.jpg"
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
                  bookingId: decoded.bookingId,
                  documentType,
                  documentNumber,
                  emergencyContactName,
                  emergencyContactPhone,
                  acceptTerms,
                });
              }}
            >
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
                    placeholder="Nombre completo"
                    helpText="Nombre completo"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                  />

                  <InputField
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
                          El huésped se compromete a realizar el pago total
                          indicado.
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
                {isPending ? "Confirmando reserva..." : "Confirmar reserva"}
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

              <h2 className="mt-2 text-2xl font-bold ">Tu estancia</h2>
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

                  <Text className="font-medium ">{decoded.nameMain}</Text>
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
                    {new Date(decoded.startDate).toLocaleDateString()} -{" "}
                    {new Date(decoded.endDate).toLocaleDateString()}
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
                    ${decoded?.totalPrice?.toLocaleString()}
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
