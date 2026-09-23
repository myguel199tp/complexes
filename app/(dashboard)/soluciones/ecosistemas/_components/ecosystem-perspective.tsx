"use client";

/**
 * Perspectiva del ecosistema: qué actor eligió el visitante en el mapa.
 *
 * Vive fuera del mapa porque la elección no es solo de la tarjeta de detalle:
 * los circuitos, las etapas y el cierre de la página se leen desde ese mismo
 * punto de vista. `null` significa "todo el ecosistema" —nada se atenúa—, y es
 * el estado inicial para que quien llega vea el panorama completo antes de
 * elegir.
 */

import { createContext, useContext, useMemo, useState } from "react";
import { ACTORS, type Actor, type ActorId } from "./ecosystem-data";

interface EcosystemPerspective {
  activo: ActorId | null;
  actor: Actor | null;
  setActivo: (id: ActorId | null) => void;
}

const PerspectiveContext = createContext<EcosystemPerspective | null>(null);

export function EcosystemPerspectiveProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [activo, setActivo] = useState<ActorId | null>(null);

  const value = useMemo(
    () => ({
      activo,
      actor: ACTORS.find((item) => item.id === activo) ?? null,
      setActivo,
    }),
    [activo],
  );

  return (
    <PerspectiveContext.Provider value={value}>
      {children}
    </PerspectiveContext.Provider>
  );
}

export function useEcosystemPerspective(): EcosystemPerspective {
  const value = useContext(PerspectiveContext);
  if (!value) {
    throw new Error(
      "useEcosystemPerspective debe usarse dentro de EcosystemPerspectiveProvider",
    );
  }
  return value;
}

/**
 * ¿Este contenido le habla al actor elegido? Sin actor elegido, todo aplica.
 */
export function esRelevante(
  activo: ActorId | null,
  actores: readonly ActorId[],
): boolean {
  return activo === null || actores.includes(activo);
}
