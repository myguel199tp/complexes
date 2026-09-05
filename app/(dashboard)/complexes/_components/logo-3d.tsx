"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";
import "./style.css";

/**
 * El logo del hero con profundidad: flota y gira suavemente por su cuenta, y se
 * inclina siguiendo el mouse.
 *
 * La inclinación no gira nunca los 360°: `/nameImage.png` es una imagen plana,
 * así que a 90° quedaría de canto (invisible) y entre 90° y 270° se leería
 * espejado. El rango se queda en ±18°, que es donde el logo se lee como un
 * objeto con volumen sin dejar de leerse como logo.
 *
 * El giro de reposo y la inclinación del mouse viven en dos capas anidadas
 * porque son dos `transform` sobre el mismo elemento: una la escribe una
 * animación CSS y la otra JS, y en un solo nodo la última en aplicarse pisaría
 * a la otra.
 */

/** Cuánto se inclina en los bordes del contenedor, en grados. */
const MAX_TILT = 18;

export default function Logo3d() {
  const tiltRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const node = tiltRef.current;
    if (!node) return;

    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    // -1 a 1 desde el centro del contenedor.
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    // El eje X se invierte: mover el mouse hacia arriba tiene que levantar el
    // borde de arriba, no hundirlo.
    node.style.setProperty("--tilt-y", `${x * 2 * MAX_TILT}deg`);
    node.style.setProperty("--tilt-x", `${-y * 2 * MAX_TILT}deg`);
  }, []);

  const handleLeave = useCallback(() => {
    const node = tiltRef.current;
    if (!node) return;
    node.style.setProperty("--tilt-y", "0deg");
    node.style.setProperty("--tilt-x", "0deg");
  }, []);

  return (
    <div
      className="logo3d-stage"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {/* El resplandor se queda quieto detrás: si girara con el logo se vería
          como una mancha pegada y no como una luz del ambiente. */}
      <div className="logo3d-glow" aria-hidden />

      <div ref={tiltRef} className="logo3d-tilt">
        <div className="logo3d-float">
          <Image
            src="/nameImage.png"
            alt="globaliaph"
            width={470}
            height={313}
            priority
            sizes="(min-width: 1280px) 470px, 300px"
            className="h-auto w-[300px] select-none xl:w-[470px]"
          />
        </div>
      </div>
    </div>
  );
}
