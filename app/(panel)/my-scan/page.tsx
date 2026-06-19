"use client";

import { useState } from "react";
import { useValidateGuestAccess } from "./_components/guestAccess-mutations";
import QrScanner from "./_components/QrScanner";
import { Title, Text, Buton } from "complexes-next-components";
import { ValidateGuestAccessResponse } from "./services/guestAccessservice";

export default function ScanPage() {
  const mutation = useValidateGuestAccess();
  const [allowed, setAllowed] = useState<ValidateGuestAccessResponse | null>(
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

  return (
    <div className="p-4">
      <Title size="md" font="bold" as="h3" className="mb-4">
        Escanear acceso
      </Title>

      {!allowed && !deniedMessage && <QrScanner onScan={handleScan} />}

      {allowed && (
        <div className="bg-green-100 p-4 mt-4 rounded">
          <Title as="h4" font="bold" size="md">
            Acceso permitido
          </Title>
          <Text size="sm">Huésped: {allowed.guestName}</Text>
          <Text size="sm">
            Válido hasta: {new Date(allowed.validTo).toLocaleString()}
          </Text>
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
