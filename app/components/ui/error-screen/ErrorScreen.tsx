"use client";

import { Button, Text, Title } from "complexes-next-components";

interface Props {
  /** Encabezado corto: qué falló, en el lenguaje de quien está mirando. */
  title: string;
  /** Una o dos frases sobre qué puede hacer. Sin jerga técnica. */
  message: string;
  /**
   * El `reset` que Next entrega al error boundary. Vuelve a montar el segmento
   * que falló sin recargar la página entera, así que no se pierde la sesión ni
   * el estado del resto de la aplicación.
   */
  onRetry: () => void;
  /** Texto del botón cuando "Reintentar" no es lo que corresponde. */
  retryLabel?: string;
}

/**
 * Cuerpo compartido de las pantallas de error.
 *
 * Vive aparte porque hay un `error.tsx` por dominio (público, panel, comercio,
 * repartidor, registro) y todos muestran lo mismo salvo el texto: si el diseño
 * cambia, cambia una vez.
 */
export default function ErrorScreen({
  title,
  message,
  onRetry,
  retryLabel = "Reintentar",
}: Props) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-6 text-center">
      <Title as="h1" size="md" font="bold">
        {title}
      </Title>

      <Text size="sm" className="max-w-md">
        {message}
      </Text>

      <Button colVariant="primary" rounded="lg" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  );
}
