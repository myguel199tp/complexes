"use client";

import { Suspense } from "react";
import AllFees from "../_components/allfees";
import { Text } from "complexes-next-components";

/**
 * El formulario lee `?id=` con `useSearchParams` para abrirse sobre una
 * configuración existente, y Next exige un límite de Suspense alrededor de
 * cualquier componente que lo use o falla al prerenderizar la ruta.
 */
export default function Page() {
  return (
    <Suspense fallback={<Text size="sm" className="p-4">Cargando configuración...</Text>}>
      <AllFees />
    </Suspense>
  );
}
