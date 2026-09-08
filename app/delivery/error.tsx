"use client";

import ErrorScreen from "@/app/components/ui/error-screen/ErrorScreen";

/**
 * Aplicación del repartidor. Se usa en la calle y con mala señal, así que el
 * mensaje trata la caída de red como lo más probable.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      title="No pudimos cargar tus entregas"
      message="Revisa tu conexión y vuelve a intentarlo. Tus entregas asignadas no se pierden."
      onRetry={reset}
    />
  );
}
