"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { protectedFileUrl } from "@/app/helpers/fileUrl";

/**
 * Archivo de una carpeta protegida de `uploads` —documentos del conjunto,
 * PDF de una PQR—, listo para un `<iframe>` o un `<a href>`.
 *
 * El backend dejó de servir esas carpetas como estático y responde "Not found"
 * por `/uploads/...`; ahora salen por `/api/uploads/...`, que exige sesión.
 * Como un `<iframe>` no puede mandar cabeceras, se descarga el binario y se
 * expone como object URL.
 *
 * Es el mismo patrón que `usePqrEvidence` y `useFeeProof`.
 */
export function useProtectedFile(stored: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setUrl(null);

    const source = protectedFileUrl(stored);

    if (!source) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    void (async () => {
      try {
        const response = await fetchWithAuth(source);

        if (!response.ok) {
          if (!cancelled) setFailed(true);
          return;
        }

        const blob = await response.blob();

        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      // Sin esto el blob queda retenido mientras viva la pestaña.
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [stored]);

  return { url, failed };
}

/**
 * Abre en otra pestaña un archivo protegido, descargándolo al hacer clic.
 *
 * Para las tablas y listas que solo muestran un enlace: bajar de una vez el
 * PDF de cada fila sería pagar por archivos que casi nadie abre.
 */
export async function openProtectedFile(stored: string | null | undefined) {
  const source = protectedFileUrl(stored);

  if (!source) return;

  // La pestaña se abre antes de esperar la descarga: después del `await` el
  // navegador ya no lo cuenta como un clic del usuario y bloquea la ventana.
  const tab = window.open("", "_blank");

  try {
    const response = await fetchWithAuth(source);

    if (!response.ok) throw new Error("No se pudo abrir el archivo");

    const objectUrl = URL.createObjectURL(await response.blob());

    if (tab) {
      tab.location.href = objectUrl;
    } else {
      window.open(objectUrl, "_blank");
    }

    // La pestaña ya cargó el archivo para entonces; revocar libera el blob.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    tab?.close();
    throw error;
  }
}
