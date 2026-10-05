"use client";

import { useEffect, useState } from "react";

import {
  AiAssistantService,
  type AssistantSectionInfo,
} from "../services/aiAssistantService";

/**
 * La tabla se pide una vez por pestaña y se comparte: el globito la consulta
 * en cada navegación y no tiene sentido ir al servidor por algo que no cambia
 * mientras el panel está abierto.
 */
let cached: Promise<AssistantSectionInfo[]> | null = null;

function loadSections(): Promise<AssistantSectionInfo[]> {
  if (!cached) {
    cached = new AiAssistantService().getSections().catch(() => {
      // Sin tabla el globito queda genérico; se reintenta en la próxima carga.
      cached = null;
      return [];
    });
  }
  return cached;
}

/** El mismo criterio que el backend: cualquier segmento de la ruta vale. */
function findSection(
  sections: AssistantSectionInfo[],
  pathname: string | null,
): AssistantSectionInfo | null {
  if (!pathname) return null;

  const segments = pathname
    .split("?")[0]
    .split("/")
    .map((segment) => segment.trim().toLowerCase())
    .filter(Boolean);

  for (const segment of segments) {
    const section = sections.find((s) => s.routes.includes(segment));
    if (section) return section;
  }

  return null;
}

/**
 * La sección en la que está el usuario, null fuera de las que Lary conoce y
 * `undefined` mientras llega la tabla.
 *
 * @param enabled Sin asistente no se pide la tabla.
 */
export function useAssistantSection(
  pathname: string | null,
  enabled = true,
): AssistantSectionInfo | null | undefined {
  const [sections, setSections] = useState<AssistantSectionInfo[] | null>(
    null,
  );

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    void loadSections().then((loaded) => {
      if (!cancelled) setSections(loaded);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!sections) return undefined;
  return findSection(sections, pathname);
}
