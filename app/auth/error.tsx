"use client";

import ErrorScreen from "@/app/components/ui/error-screen/ErrorScreen";

/**
 * Pantalla de acceso.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      title="No pudimos cargar el inicio de sesión"
      message="Tuvimos un problema al abrir la pantalla de acceso. Vuelve a intentarlo."
      onRetry={reset}
    />
  );
}
