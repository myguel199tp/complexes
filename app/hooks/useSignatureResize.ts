"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type SignatureCanvas from "react-signature-canvas";

/**
 * Mantiene un `SignatureCanvas` de ancho fluido alineado con su recuadro.
 *
 * El lienzo se usa sin `width`/`height` en `canvasProps` (la librería lo mide
 * al montar) y con `clearOnResize={false}`: en móvil la barra de direcciones y
 * el teclado disparan `resize` y la librería borraba la firma a mitad del
 * formulario. A cambio, si cambia el ancho del recuadro (girar el teléfono,
 * abrir un modal que montó oculto) hay que volver a medir el lienzo; si no,
 * el trazo queda desplazado del dedo. Aquí se re-mide y se le devuelven los
 * trazos que ya tenía.
 *
 * Devuelve el `ref` para el recuadro que envuelve al lienzo. `onResize` sirve
 * para regenerar la imagen guardada, que queda con el tamaño anterior.
 */
export function useSignatureResize(
  sigCanvas: RefObject<SignatureCanvas>,
  onResize?: (pad: SignatureCanvas) => void,
) {
  // Estado y no useRef: el recuadro puede montarse después (modales), y el
  // efecto tiene que enterarse.
  const [box, setBox] = useState<HTMLDivElement | null>(null);

  const onResizeRef = useRef(onResize);
  useEffect(() => {
    onResizeRef.current = onResize;
  });

  useEffect(() => {
    if (!box) return;

    let lastWidth = box.clientWidth;
    const observer = new ResizeObserver(() => {
      const pad = sigCanvas.current;
      if (!pad || box.clientWidth === lastWidth) return;
      lastWidth = box.clientWidth;

      const strokes = pad.toData();
      pad._resizeCanvas();
      pad.fromData(strokes);
      onResizeRef.current?.(pad);
    });

    observer.observe(box);
    return () => observer.disconnect();
  }, [box, sigCanvas]);

  return setBox;
}
