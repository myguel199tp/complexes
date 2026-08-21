"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  /** Con `false` aparece completo de golpe (mensajes ya vistos del historial). */
  animate: boolean;
  /** Se llama en cada fotograma revelado, para que el chat siga bajando solo. */
  onReveal?: () => void;
  onDone?: () => void;
}

/**
 * Revela el texto progresivamente, como si se escribiera.
 *
 * El motor actual resuelve la respuesta completa antes de poder enviar nada
 * —son consultas a la base, no generación palabra por palabra—, así que el
 * texto llega entero y el ritmo lo pone el cliente. Cuando el backend empiece a
 * emitir tokens reales, `text` crecerá poco a poco y este componente seguirá
 * funcionando igual: siempre revela hasta donde haya llegado.
 */
export default function TypedText({ text, animate, onReveal, onDone }: Props) {
  const [visible, setVisible] = useState(animate ? 0 : text.length);
  const frameRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!animate) {
      setVisible(text.length);
      return;
    }

    // Ritmo constante en caracteres por segundo, con un tope de duración: un
    // resumen de cartera de 900 caracteres tardaría diez segundos a velocidad
    // fija y el usuario ya lo habría leído entero mucho antes de que terminara.
    const charsPerSecond = Math.max(260, text.length / 2.2);

    let last = performance.now();

    const step = (now: number) => {
      const delta = ((now - last) / 1000) * charsPerSecond;
      last = now;

      setVisible((current) => {
        const next = Math.min(text.length, current + delta);

        if (next >= text.length) {
          if (!doneRef.current) {
            doneRef.current = true;
            onDone?.();
          }
          return text.length;
        }

        frameRef.current = requestAnimationFrame(step);
        onReveal?.();
        return next;
      });
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // `onReveal`/`onDone` quedan fuera a propósito: son callbacks recreados en
    // cada render del padre y reiniciarían la animación desde cero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, animate]);

  const shown = text.slice(0, Math.floor(visible));
  const typing = animate && visible < text.length;

  return (
    <p className="whitespace-pre-wrap break-words">
      {shown}
      {typing ? (
        <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-[2px] animate-pulse bg-cyan-300" />
      ) : null}
    </p>
  );
}
