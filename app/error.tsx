"use client";

import ErrorScreen from "@/app/components/ui/error-screen/ErrorScreen";

/**
 * Red de seguridad de todo el árbol: sólo llega aquí lo que no atrapó el
 * error.tsx de su propio dominio, o lo que falla en una ruta suelta como
 * /parqueadero o /estadia.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      title="Algo salió mal"
      message="No pudimos cargar esta pantalla. Vuelve a intentarlo; si el problema sigue, escríbenos y lo revisamos."
      onRetry={reset}
    />
  );
}
