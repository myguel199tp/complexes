/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";

interface BookingTokenPayload {
  bookingId: string;
  nameMain: string;
  email: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

export default function BookingCompletePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [documentType, setDocumentType] = useState<"CC" | "PASSPORT">("CC");
  const [documentNumber, setDocumentNumber] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // 🔓 Decodificar token (solo lectura)
  const decoded = useMemo(() => {
    try {
      return jwtDecode<BookingTokenPayload>(token);
    } catch {
      return null;
    }
  }, [token]);

  // ❌ Token inválido
  if (!decoded) {
    return <p>Enlace inválido o expirado</p>;
  }

  // 🔁 Mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/booking/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: decoded.bookingId,
            documentType,
            documentNumber,
            emergencyContactName,
            emergencyContactPhone,
            acceptTerms,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error confirmando la reserva");
      }

      return result;
    },

    onSuccess: () => {
      showAlert("Reserva confirmada con éxito 🎉", "success");
      router.push("/booking/success");
    },

    onError: (error: any) => {
      showAlert(error.message, "error");
    },
  });

  // ❗ Validación mínima front
  const disabled =
    !documentNumber ||
    !emergencyContactName ||
    !emergencyContactPhone ||
    !acceptTerms;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Completa tu reserva</h1>

      {/* 🧾 RESUMEN */}
      <div className="bg-gray-100 p-4 rounded">
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

      {/* 📄 FORMULARIO */}
      <div className="space-y-4">
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as "CC" | "PASSPORT")}
          className="w-full border p-2 rounded"
        >
          <option value="CC">Cédula</option>
          <option value="PASSPORT">Pasaporte</option>
        </select>

        <input
          placeholder="Número de documento"
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Nombre contacto de emergencia"
          value={emergencyContactName}
          onChange={(e) => setEmergencyContactName(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Teléfono contacto de emergencia"
          value={emergencyContactPhone}
          onChange={(e) => setEmergencyContactPhone(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          Acepto términos y condiciones
        </label>

        <button
          disabled={disabled || isPending}
          onClick={() => mutate()}
          className="w-full bg-blue-600 text-white py-3 rounded disabled:opacity-50"
        >
          {isPending ? "Confirmando..." : "Confirmar reserva"}
        </button>
      </div>
    </div>
  );
}
