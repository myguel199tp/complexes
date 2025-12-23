"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

type Props = {
  onScan: (code: string) => void;
};

export default function QrScanner({ onScan }: Props) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      (error) => {
        // errores silenciosos
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScan]);

  return <div id="qr-reader" className="w-full" />;
}
