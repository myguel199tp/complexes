"use client";

import SharedQrScanner from "@/app/components/ui/qr-scanner/QrScanner";

type Props = {
  onScan: (code: string) => void;
};

export default function QrScanner({ onScan }: Props) {
  return <SharedQrScanner onScan={onScan} scannerId="qr-reader" />;
}
