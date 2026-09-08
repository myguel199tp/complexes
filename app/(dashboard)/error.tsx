"use client";

import ErrorScreen from "@/app/components/ui/error-screen/ErrorScreen";

/**
 * Zona pública: portada, landings de solución, inmuebles y aliados. Quien llega
 * aquí puede no conocer la plataforma, así que el texto no da nada por sabido.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      title="No pudimos cargar esta página"
      message="Tuvimos un problema al mostrar el contenido. Vuelve a intentarlo en un momento."
      onRetry={reset}
    />
  );
}
