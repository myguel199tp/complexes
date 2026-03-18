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

      <form className="space-y-4">
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
        />

        <InputField
          placeholder="Nombre contacto de emergencia"
          value={emergencyContactName}
          onChange={(e) => setEmergencyContactName(e.target.value)}
        />

        <InputField
          placeholder="Teléfono contacto de emergencia"
          value={emergencyContactPhone}
          onChange={(e) => setEmergencyContactPhone(e.target.value)}
        />

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Términos y Condiciones de la Reserva
            </h3>
            <p className="text-xs text-gray-500">
              Lea atentamente antes de confirmar su reserva
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-3 px-4 py-3 text-xs leading-relaxed text-gray-600">
            <p>
              Al confirmar esta reserva, el huésped declara haber leído,
              comprendido y aceptado los presentes Términos y Condiciones que
              regulan el uso de la plataforma y la gestión de reservas entre
              huéspedes y alojamientos.
            </p>

            <div>
              <p className="font-semibold text-gray-800">
                1. Naturaleza del Servicio
              </p>
              <p>
                La plataforma actúa únicamente como intermediaria tecnológica
                que permite a los usuarios buscar, comparar y realizar reservas
                en propiedades publicadas por terceros. La plataforma no es
                propietaria, administradora ni operadora de los alojamientos
                ofrecidos.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">
                2. Responsabilidad del Alojamiento
              </p>
              <p>
                Cada alojamiento es responsable de la exactitud de la
                información publicada, incluyendo disponibilidad, precios,
                fotografías, servicios y condiciones de hospedaje.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">
                3. Confirmación de Reserva
              </p>
              <p>
                Una reserva se considera confirmada únicamente cuando el sistema
                emite una confirmación electrónica.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">4. Pagos</p>
              <p>
                El huésped se compromete a pagar el monto total de la reserva
                indicado al momento de la confirmación. Los cargos adicionales
                durante la estancia serán responsabilidad exclusiva del huésped
                frente al alojamiento.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">
                5. Políticas del Alojamiento
              </p>
              <p>
                Cada propiedad puede establecer políticas específicas
                relacionadas con cancelaciones, depósitos, horarios de entrada y
                salida y normas de convivencia.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">
                6. Cancelaciones y Modificaciones
              </p>
              <p>
                Las condiciones de cancelación o modificación de reservas
                dependen de la política definida por el alojamiento.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">
                7. Conducta del Huésped
              </p>
              <p>
                El huésped deberá respetar las normas del alojamiento y
                abstenerse de realizar actividades ilegales o que afecten la
                seguridad de la propiedad.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">
                8. Limitación de Responsabilidad
              </p>
              <p>
                La plataforma no será responsable por incidentes, accidentes,
                pérdidas, daños o inconvenientes ocurridos durante la estancia
                del huésped en la propiedad.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">
                9. Protección de Datos
              </p>
              <p>
                La información personal proporcionada será utilizada únicamente
                para la gestión de la reserva conforme a la legislación vigente.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">10. Aceptación</p>
              <p>
                Al marcar la casilla de aceptación y confirmar la reserva, el
                huésped reconoce haber leído y aceptado estos términos en su
                totalidad.
              </p>
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          He leído y acepto los Términos y Condiciones de la reserva
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
      </form>
    </div>
  );
}
