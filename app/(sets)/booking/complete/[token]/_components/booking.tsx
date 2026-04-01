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
} from "complexes-next-components";
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
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <h2 className="mb-3 text-xl font-semibold">Enlace no válido</h2>
          <p className="text-sm text-gray-600">
            El enlace es inválido o ha expirado.
          </p>
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
    <div className="mx-auto max-w-xl space-y-6 p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Avatar
          src="/complex.png"
          alt="complexes"
          size="md"
          border="thick"
          shape="rounded"
        />
        <Title size="md" font="bold">
          Completa tu reserva
        </Title>
      </div>

      {/* RESUMEN RESERVA */}
      <div className="rounded-xl bg-gray-100 p-4 text-sm">
        <p>
          <strong>Huésped:</strong> {decoded.nameMain}
        </p>
        <p>
          <strong>Entrada:</strong>{" "}
          {new Date(decoded.startDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Salida:</strong>{" "}
          {new Date(decoded.endDate).toLocaleDateString()}
        </p>

        <p className="mt-2 text-lg font-semibold">
          Total: ${decoded?.totalPrice?.toLocaleString()}
        </p>
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
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Documento de identidad
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              value={documentType}
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
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
            />
          </div>
        </div>

        {/* CONTACTO EMERGENCIA */}
        <div className="space-y-3 rounded-xl border bg-gray-50 p-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Contacto de emergencia
            </h3>

            <p className="text-xs text-gray-500">
              Persona a contactar en caso de emergencia durante la estancia
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputField
              placeholder="Nombre completo"
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
            />

            <InputField
              placeholder="Teléfono"
              value={emergencyContactPhone}
              onChange={(e) => setEmergencyContactPhone(e.target.value)}
            />
          </div>
        </div>

        {/* TERMINOS */}
        <div className="rounded-xl border bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setShowTerms(!showTerms)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Términos y condiciones
              </p>

              <p className="text-xs text-gray-500">
                Lea antes de confirmar la reserva
              </p>
            </div>

            <span className="text-sm text-gray-500">
              {showTerms ? "Cerrar" : "Ver"}
            </span>
          </button>

          {showTerms && (
            <div className="max-h-72 overflow-y-auto space-y-3 border-t px-4 py-3 text-xs leading-relaxed text-gray-600">
              <p>
                Al confirmar esta reserva, el huésped declara haber leído,
                comprendido y aceptado los presentes Términos y Condiciones que
                regulan el uso de la plataforma.
              </p>

              <div>
                <p className="font-semibold text-gray-800">
                  1. Naturaleza del Servicio
                </p>
                <p>
                  La plataforma actúa como intermediaria tecnológica entre
                  huéspedes y alojamientos.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800">
                  2. Responsabilidad del Alojamiento
                </p>
                <p>
                  Cada alojamiento es responsable de la información publicada,
                  disponibilidad y condiciones de hospedaje.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800">3. Pagos</p>
                <p>
                  El huésped se compromete a pagar el monto total indicado en la
                  reserva.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800">
                  4. Conducta del Huésped
                </p>
                <p>
                  El huésped deberá respetar las normas del alojamiento y las
                  leyes aplicables.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800">
                  5. Protección de Datos
                </p>
                <p>
                  La información personal se utilizará únicamente para la
                  gestión de la reserva.
                </p>
              </div>
            </div>
          )}

          <div className="border-t px-4 py-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              Acepto los términos y condiciones
            </label>
          </div>
        </div>

        {/* BOTON */}
        <button
          type="submit"
          disabled={disabled || isPending}
          className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Confirmando..." : "Confirmar reserva"}
        </button>

        <p className="text-center text-xs text-gray-400">
          🔒 Tu información será utilizada únicamente para gestionar la reserva
        </p>
      </form>
    </div>
  );
}
