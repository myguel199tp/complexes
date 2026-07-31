"use client";

import { useEffect, useState } from "react";

/**
 * Retrasa la propagación de un valor hasta que deja de cambiar durante `delay` ms.
 * Útil para no disparar una petición por cada tecla en un buscador.
 */
export function useDebouncedValue<T>(value: T, delay: number = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
