"use client";

import ErrorScreen from "@/app/components/ui/error-screen/ErrorScreen";

/**
 * Registro, activación de cuenta, OTP, pagos y firma. Son flujos de un solo
 * intento, y lo importante es que nadie crea que su registro o su pago se
 * duplicó por reintentar.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      title="No pudimos completar este paso"
      message="Algo falló mientras procesábamos la operación. Reintenta desde aquí; no se envió nada dos veces."
      onRetry={reset}
    />
  );
}
