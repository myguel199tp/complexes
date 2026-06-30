"use client";

import { useState } from "react";
import { Title, Text, Buton } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useSidebarInformation } from "@/app/components/ui/sidebar-information";
import QrScanner from "./_components/QrScanner";
import { useValidateDeliveryAccess } from "./_components/deliveryAccess-mutations";
import { ValidateDeliveryAccessResponse } from "./services/deliveryAccessService";

export default function DeliveryAccessPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const { valueState } = useSidebarInformation();
  const canValidate =
    valueState.userRolName.includes("porter") ||
    valueState.userRolName.includes("employee");

  const mutation = useValidateDeliveryAccess(conjuntoId);
  const [allowed, setAllowed] = useState<ValidateDeliveryAccessResponse | null>(
    null,
  );
  const [deniedMessage, setDeniedMessage] = useState<string | null>(null);

  const handleScan = (code: string) => {
    mutation.mutate(code, {
      onSuccess: (data) => {
        setDeniedMessage(null);
        setAllowed(data);
      },
      onError: (error: Error) => {
        setAllowed(null);
        setDeniedMessage(error.message);
      },
    });
  };

  const reset = () => {
    setAllowed(null);
    setDeniedMessage(null);
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
      <Title size="md" font="bold" as="h3" className="mb-4" colVariant="on">
        Escanear acceso de domicilios
      </Title>

      {!allowed && !deniedMessage && <QrScanner onScan={handleScan} />}

      {allowed && (
        <div className="bg-green-100 p-4 mt-4 rounded">
          <Title as="h4" font="bold" size="md" colVariant="on">
            Acceso permitido
          </Title>
          {allowed.deliveryName && (
            <Text size="sm">Repartidor: {allowed.deliveryName}</Text>
          )}
          {allowed.licensePlate && (
            <Text size="sm">Placa: {allowed.licensePlate}</Text>
          )}
          <Text size="sm">
            Válido hasta: {new Date(allowed.validTo).toLocaleString()}
          </Text>

          <Text size="sm" font="bold" className="mt-2">
            Paradas pendientes:
          </Text>
          {allowed.stops.length === 0 ? (
            <Text size="sm">Sin paradas pendientes en este viaje.</Text>
          ) : (
            <ul className="list-disc pl-5">
              {allowed.stops.map((stop) => (
                <li key={stop.orderId}>
                  <Text size="sm">{stop.deliveryAddress || stop.orderId}</Text>
                </li>
              ))}
            </ul>
          )}

          <Buton borderWidth="none" className="mt-2 underline" onClick={reset}>
            Volver a escanear
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
    </div>
  );
}
