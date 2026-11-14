"use client";

import type { ComponentPropsWithoutRef } from "react";
import { Modal } from "complexes-next-components";

type Props = ComponentPropsWithoutRef<typeof Modal>;

/**
 * Modal de las pantallas del comercio.
 *
 * - Va por encima de los botones flotantes del asistente y de Lary, que el
 *   layout monta con z-50: con el z-50 por defecto del Modal empataban y, por
 *   venir después en el DOM, quedaban encima del formulario.
 * - `overflow-x-hidden`: los formularios pasan `overflow-y-auto`, que vuelve
 *   desplazable también el eje x. En el celular, una fila que no cabía hacía
 *   la caja desplazable de lado y el formulario quedaba corrido y cortado a la
 *   izquierda. Las filas ya se apilan en pantallas angostas; esto es la red
 *   por si una nueva se escapa.
 */
export default function ComercioModal({
  className,
  zIndex = "z-[70]",
  ...props
}: Props) {
  return (
    <Modal
      {...props}
      zIndex={zIndex}
      className={`${className ?? "w-11/12 max-w-md"} overflow-x-hidden`}
    />
  );
}
