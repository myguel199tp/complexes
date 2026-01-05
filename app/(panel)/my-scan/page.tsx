"use client";

import { useState } from "react";
import { useValidateGuestAccess } from "./_components/guestAccess-mutations";
import QrScanner from "./_components/QrScanner";
import { Title, Text, Buton } from "complexes-next-components";

export default function ScanPage() {
  const mutation = useValidateGuestAccess();
  const [result, setResult] = useState<any>(null);

  const handleScan = (code: string) => {
    mutation.mutate(code, {
      onSuccess: (data) => {
        setResult({ success: true, data });
      },
      onError: (error: any) => {
        setResult({ success: false, message: error.message });
      },
    });
  };

  return (
    <div className="p-4">
      <Title size="md" font="bold" as="h3" className="mb-4">
        Escanear acceso
      </Title>

      {!result && <QrScanner onScan={handleScan} />}

      {result?.success && (
        <div className="bg-green-100 p-4 mt-4 rounded">
          <Title as="h4" font="bold" size="md">
            Acceso permitido
          </Title>
          <Text size="sm">Huésped: {result.data.guestName}</Text>
          <Text size="sm">
            Válido hasta: {new Date(result.data.validTo).toLocaleString()}
          </Text>
        </div>
      )}

      {result && !result.success && (
        <div className="bg-red-100 p-4 mt-4 rounded">
          <Title as="h4" font="bold" size="md">
            Acceso denegado
          </Title>
          <Text size="sm">{result.message}</Text>
          <Buton
            borderWidth="none"
            className="mt-2 underline"
            onClick={() => setResult(null)}
          >
            Volver a escanear
          </Buton>
        </div>
      )}
    </div>
  );
}
