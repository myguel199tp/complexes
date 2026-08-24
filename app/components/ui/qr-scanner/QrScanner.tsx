"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useId } from "react";

type Props = {
  onScan: (code: string) => void;
  /**
   * Id del contenedor. Se deja configurable porque html5-qrcode monta el DOM
   * por id y dos escáneres visibles a la vez se pisarían entre sí.
   */
  scannerId?: string;
};

/**
 * html5-qrcode pinta su propio panel en inglés y con un icono negro que
 * desaparece sobre los fondos oscuros del panel. Aquí se traduce el texto y se
 * reestiliza el DOM que genera la librería para que se entienda qué hay que
 * hacer.
 */
const LABELS: Record<string, string> = {
  "Request Camera Permissions": "Permitir uso de la cámara",
  "Scan an Image File": "Escanear una imagen",
  "Scan using camera directly": "Escanear con la cámara",
  "Start Scanning": "Iniciar escaneo",
  "Stop Scanning": "Detener escaneo",
  "Switch On Torch": "Encender linterna",
  "Switch Off Torch": "Apagar linterna",
  "Choose Image": "Elegir imagen",
  "No image choosen": "Ningún archivo seleccionado",
  "No image chosen": "Ningún archivo seleccionado",
  "Select Camera": "Cámara",
  "Camera based scan": "Escanear con la cámara",
  "File based scan": "Escanear una imagen",
};

function translate(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>("button, a, span, div, label, select option")
    .forEach((node) => {
      const hasOnlyText =
        node.childNodes.length === 1 &&
        node.firstChild?.nodeType === Node.TEXT_NODE;
      if (!hasOnlyText) return;

      const current = node.textContent?.trim() ?? "";
      const translated = LABELS[current];
      if (translated) node.textContent = translated;
    });
}

export default function QrScanner({ onScan, scannerId }: Props) {
  const generatedId = useId().replace(/:/g, "");
  const containerId = scannerId ?? `qr-reader-${generatedId}`;

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      containerId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false,
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      () => {},
    );

    // La librería reconstruye su panel al pedir permisos o al cambiar de modo,
    // así que hay que volver a traducir cada vez que cambia el DOM.
    const container = document.getElementById(containerId);
    let observer: MutationObserver | undefined;

    if (container) {
      translate(container);
      observer = new MutationObserver(() => translate(container));
      observer.observe(container, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      scanner.clear().catch(() => {});
    };
  }, [onScan, containerId]);

  return (
    <div className="qr-scanner-shell w-full rounded-xl border border-cyan-500/40 bg-white/5 p-4">
      <p className="mb-3 text-center text-sm text-cyan-100">
        Apunta la cámara al código QR del visitante
      </p>

      <div id={containerId} className="w-full" />

      <style>{`
        .qr-scanner-shell #${containerId} {
          color: #e2e8f0;
          border: none !important;
        }
        /* El icono por defecto es un PNG negro: invisible sobre fondo oscuro. */
        .qr-scanner-shell #${containerId} img[alt="Info icon"],
        .qr-scanner-shell #${containerId} #${containerId}__scan_region img {
          filter: invert(1) opacity(0.55);
          margin: 0 auto 0.75rem;
        }
        .qr-scanner-shell #${containerId} video,
        .qr-scanner-shell #${containerId} canvas {
          width: 100% !important;
          border-radius: 0.75rem;
        }
        .qr-scanner-shell #${containerId} button {
          display: inline-block;
          margin: 0.25rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 9999px;
          background: #0891b2;
          color: #fff;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
        }
        .qr-scanner-shell #${containerId} button:hover {
          background: #0e7490;
        }
        .qr-scanner-shell #${containerId} a {
          display: inline-block;
          margin-top: 0.5rem;
          color: #67e8f9;
          font-size: 0.8125rem;
          text-decoration: underline;
          cursor: pointer;
        }
        .qr-scanner-shell #${containerId} select {
          margin: 0.25rem;
          padding: 0.35rem 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(103, 232, 249, 0.4);
          background: #0f172a;
          color: #e2e8f0;
        }
        .qr-scanner-shell #${containerId} span,
        .qr-scanner-shell #${containerId} div {
          color: #e2e8f0;
        }
        .qr-scanner-shell #${containerId} input[type="file"] {
          color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}
