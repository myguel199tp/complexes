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

/* =========================
   ENUMS & LABELS
========================= */

export enum PassengerDocument {
  CEDULA = "CC",
  PASAPORTE = "PASSPORT",
}

export const PASSENGER_DOCUMENT_LABELS: Record<PassengerDocument, string> = {
  [PassengerDocument.CEDULA]: "Cédula",
  [PassengerDocument.PASAPORTE]: "Pasaporte",
};

/* =========================
   COMPONENT
========================= */

export default function BookingComplete() {
  const { token } = useParams<{ token: string }>();

  const [documentType, setDocumentType] = useState<PassengerDocument>(
    PassengerDocument.CEDULA
  );
  const [documentNumber, setDocumentNumber] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

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
      <div className="flex gap-2">
        <Avatar
          src="/complex.jpg"
          alt="complexes"
          size="md"
          border="thick"
          shape="rounded"
        />
        <Title size="md" font="bold">
          Completa tu reserva
        </Title>
      </div>

      {/* RESUMEN */}
      <div className="rounded bg-gray-100 p-4">
        <p>
          <strong>Huésped:</strong> {decoded.nameMain}
        </p>
        <p>
          <strong>Entrada:</strong> {new Date(decoded.startDate).toDateString()}
        </p>
        <p>
          <strong>Salida:</strong> {new Date(decoded.endDate).toDateString()}
        </p>
        <p className="text-lg font-semibold">
          Total: ${decoded.totalPrice.toLocaleString()}
        </p>
      </div>

      {/* FORM */}
      <div className="space-y-4">
        <SelectField
          value={documentType}
          options={Object.values(PassengerDocument).map((doc) => ({
            value: doc,
            label: PASSENGER_DOCUMENT_LABELS[doc],
          }))}
          onChange={(e) => setDocumentType(e.target.value as PassengerDocument)}
        />

        <InputField
          placeholder="Número de documento"
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
          className="w-full rounded border p-2"
        />

        <InputField
          placeholder="Nombre contacto de emergencia"
          value={emergencyContactName}
          onChange={(e) => setEmergencyContactName(e.target.value)}
          className="w-full rounded border p-2"
        />

        <InputField
          placeholder="Teléfono contacto de emergencia"
          value={emergencyContactPhone}
          onChange={(e) => setEmergencyContactPhone(e.target.value)}
          className="w-full rounded border p-2"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          Acepto términos y condiciones
        </label>

        <button
          disabled={disabled || isPending}
          onClick={() =>
            mutate({
              bookingId: decoded.bookingId,
              documentType,
              documentNumber,
              emergencyContactName,
              emergencyContactPhone,
              acceptTerms,
            })
          }
          className="w-full rounded bg-blue-600 py-3 text-white disabled:opacity-50"
        >
          {isPending ? "Confirmando..." : "Confirmar reserva"}
        </button>
      </div>
    </div>
  );
}
