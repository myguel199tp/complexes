"use client";

import ErrorScreen from "@/app/components/ui/error-screen/ErrorScreen";

/**
 * Panel con sesión. La causa más común no es un fallo del código sino una
 * consulta al backend que no respondió, así que el texto apunta a reintentar
 * antes que a alarmar: la sesión sigue viva y `reset` sólo remonta la pantalla.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      title="No pudimos cargar esta sección"
      message="Hubo un problema al traer la información de tu conjunto. Reintenta; tu sesión sigue activa."
      onRetry={reset}
    />
  );
}
