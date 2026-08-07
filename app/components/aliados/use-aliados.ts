"use client";

import { useCallback, useEffect, useState } from "react";
import { AliadoB2b, aliadosService } from "./aliados-service";

type Status = "loading" | "error" | "ready";

/**
 * Carga la vitrina pública de aliados B2B. Distingue "cargando", "error" y
 * "sin datos" para que cada pantalla pueda mostrar un estado propio en lugar
 * de quedarse en blanco.
 */
export function useAliados() {
  const [aliados, setAliados] = useState<AliadoB2b[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  const load = useCallback(() => {
    setStatus("loading");
    aliadosService()
      .then((data) => {
        setAliados(Array.isArray(data) ? data : []);
        setStatus("ready");
      })
      .catch(() => {
        setAliados([]);
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    aliados,
    isLoading: status === "loading",
    isError: status === "error",
    reload: load,
  };
}
