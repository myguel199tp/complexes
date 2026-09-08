"use client";

import ErrorScreen from "@/app/components/ui/error-screen/ErrorScreen";

/**
 * Panel del comercio aliado: catálogo, pedidos, sucursales y planes B2B.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      title="No pudimos cargar tu panel"
      message="Hubo un problema al traer la información de tu comercio. Vuelve a intentarlo."
      onRetry={reset}
    />
  );
}
