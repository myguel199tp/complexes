"use client";

import { useState } from "react";
import {
  Title,
  Text,
  Buton,
  Button,
  InputField,
} from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useSidebarInformation } from "@/app/components/ui/sidebar-information";
import QrScanner from "./_components/QrScanner";
import { useValidateAccessCode } from "./_components/deliveryAccess-mutations";
import { ValidatedAccessResponse } from "../services/response/AccessPassResponse";
import { GuestFeeDueError } from "../services/stayChargeService";
import StayChargeModal from "./_components/stay-charge-modal";

const SOURCE_LABEL: Record<ValidatedAccessResponse["source"], string> = {
  ACCESS_PASS: "Pase de residente",
  GUEST_ACCESS: "Huésped de alquiler",
  DELIVERY_RUN: "Domicilio",
};

/**
 * Pantalla única de validación de accesos. Antes solo leía los pases de
 * domicilios y los códigos de huésped se comprobaban por otro lado, así que el
 * portero tenía que saber de antemano qué clase de código le mostraban.
 */
export default function AccessValidationPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const { valueState } = useSidebarInformation();
  const canValidate =
    valueState.userRolName.includes("porter") ||
    valueState.userRolName.includes("employee");

  const mutation = useValidateAccessCode(conjuntoId);
  const [allowed, setAllowed] = useState<ValidatedAccessResponse | null>(null);
  const [deniedMessage, setDeniedMessage] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  /**
   * Cobro pendiente del huésped externo. Es lo único que no se resuelve
   * mostrando un cartel: hay que cobrar y volver a validar.
   */
  const [feeDue, setFeeDue] = useState<GuestFeeDueError | null>(null);
  const [lastCode, setLastCode] = useState("");

  const handleScan = (code: string) => {
    setLastCode(code);

    mutation.mutate(code, {
      onSuccess: (data) => {
        setDeniedMessage(null);
        setFeeDue(null);
        setAllowed(data);
      },
      onError: (error: Error) => {
        setAllowed(null);

        // El código está bien: lo que falta es el pago del acceso. Mostrar
        // "acceso denegado" haría creer al celador que el código está malo.
        if (error instanceof GuestFeeDueError) {
          setDeniedMessage(null);
          setFeeDue(error);
          return;
        }

        setFeeDue(null);
        setDeniedMessage(error.message);
      },
    });
  };

  const reset = () => {
    setAllowed(null);
    setDeniedMessage(null);
    setFeeDue(null);
    setManualCode("");
  };

  if (!canValidate) {
    return (
      <div className="p-4">
        <Text size="sm">
          Esta pantalla es exclusiva para portería y administración del
          conjunto.
        </Text>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Title size="md" font="bold" as="h3" className="mb-1" colVariant="on">
        Validar acceso
      </Title>

      <Text size="xs" className="mb-4 text-gray-500">
        Sirve para pases de residente, huéspedes de alquiler y domicilios.
      </Text>

      {!allowed && !deniedMessage && !feeDue && (
        <>
          <QrScanner onScan={handleScan} />

          {/* Si la cámara falla —o el visitante trae el código en papel— se digita. */}
          <div className="flex gap-2 mt-4 items-end">
            <InputField
              placeholder="O escribe el código"
              helpText="Código de acceso"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
            />
            <Button
              size="sm"
              disabled={!manualCode.trim() || mutation.isPending}
              onClick={() => handleScan(manualCode.trim())}
            >
              Validar
            </Button>
          </div>
        </>
      )}

      {allowed && (
        <div className="bg-green-100 p-4 mt-4 rounded">
          <Title as="h4" font="bold" size="md" colVariant="on">
            Acceso permitido
          </Title>

          <Text size="sm">Tipo: {SOURCE_LABEL[allowed.source]}</Text>
          <Text size="sm">Visitante: {allowed.visitorName}</Text>
          <Text size="sm">Unidad: {allowed.apartment}</Text>
          <Text size="sm">
            Válido hasta: {new Date(allowed.validTo).toLocaleString("es-CO")}
          </Text>

          <Text size="xs" className="mt-2 text-gray-600">
            Registrado en la bitácora ({allowed.visit.status}).
          </Text>

          {allowed.stops && (
            <>
              <Text size="sm" font="bold" className="mt-2">
                Paradas pendientes:
              </Text>
              {allowed.stops.length === 0 ? (
                <Text size="sm">Sin paradas pendientes en este viaje.</Text>
              ) : (
                <ul className="list-disc pl-5">
                  {allowed.stops.map((stop) => (
                    <li key={stop.orderId}>
                      <Text size="sm">
                        {stop.deliveryAddress || stop.orderId}
                      </Text>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          <Buton borderWidth="none" className="mt-2 underline" onClick={reset}>
            Validar otro acceso
          </Buton>
        </div>
      )}

      {deniedMessage && (
        <div className="bg-red-100 p-4 mt-4 rounded">
          <Title as="h4" font="bold" size="md">
            Acceso denegado
          </Title>
          <Text size="sm">{deniedMessage}</Text>
          <Buton borderWidth="none" className="mt-2 underline" onClick={reset}>
            Volver a escanear
          </Buton>
        </div>
      )}

      {/*
        Se monta con el cobro pendiente y revalida el código apenas queda
        saldado, sin que el celador tenga que volver a escanear.
      */}
      <StayChargeModal
        due={feeDue}
        isOpen={!!feeDue}
        onClose={reset}
        onSettled={() => {
          setFeeDue(null);
          if (lastCode) handleScan(lastCode);
        }}
      />
    </div>
  );
}
