"use client";

import { useState } from "react";
import { useValidateGuestAccess } from "./_components/guestAccess-mutations";
import QrScanner from "./_components/QrScanner";

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
      <h1 className="text-xl font-bold mb-4">Escanear acceso</h1>

      {!result && <QrScanner onScan={handleScan} />}

      {result?.success && (
        <div className="bg-green-100 p-4 mt-4 rounded">
          <h2 className="font-bold">Acceso permitido</h2>
          <p>Huésped: {result.data.guestName}</p>
          <p>Válido hasta: {new Date(result.data.validTo).toLocaleString()}</p>
        </div>
      )}

      {result && !result.success && (
        <div className="bg-red-100 p-4 mt-4 rounded">
          <h2 className="font-bold">Acceso denegado</h2>
          <p>{result.message}</p>
          <button className="mt-2 underline" onClick={() => setResult(null)}>
            Volver a escanear
          </button>
        </div>
      )}
    </div>
  );
}
