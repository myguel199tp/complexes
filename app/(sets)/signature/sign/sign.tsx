/* eslint-disable jsx-a11y/alt-text */
"use client";

import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import type SignatureCanvasType from "react-signature-canvas";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";

import { Button, Title } from "complexes-next-components";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useMutationSign } from "./use-sign-mutation";
import { HABEAS_DATA_TEXT } from "./constants";

/* ================= PDF STYLES ================= */

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    lineHeight: 1.6,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  section: {
    marginBottom: 12,
    textAlign: "justify",
  },
  signatureBox: {
    marginTop: 40,
    alignItems: "center",
  },
  signatureImage: {
    width: 200,
    height: 80,
    marginVertical: 10,
  },
});

/* ================= PDF DOCUMENT ================= */

interface PdfProps {
  signature: string;
  fullName: string;
  documentId: string;
}

const HabeasDataDocument = ({ signature, fullName, documentId }: PdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>
        AUTORIZACIÓN PARA EL TRATAMIENTO DE DATOS PERSONALES
      </Text>

      <Text style={styles.section}>{HABEAS_DATA_TEXT}</Text>

      <Text style={styles.section}>
        Fecha: {new Date().toLocaleDateString("es-CO")}
      </Text>

      <View style={styles.signatureBox}>
        <Text>Firma del titular</Text>

        {signature && <Image src={signature} style={styles.signatureImage} />}

        <Text>{fullName}</Text>
        <Text>{documentId}</Text>
      </View>
    </Page>
  </Document>
);

/* ================= COMPONENT ================= */

export default function Sign() {
  const sigCanvas = useRef<SignatureCanvasType | null>(null);

  const { mutateAsync, isPending } = useMutationSign();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [signature, setSignature] = useState("");
  const [fullName, setFullName] = useState("");
  const [documentId, setDocumentId] = useState("");

  /* ================= CAPTURAR FIRMA ================= */

  const handleEnd = () => {
    if (!sigCanvas.current) return;

    if (sigCanvas.current.isEmpty()) {
      setSignature("");
      return;
    }

    const data = sigCanvas.current.getCanvas().toDataURL("image/png");

    setSignature(data);
  };

  /* ================= LIMPIAR ================= */

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignature("");
  };

  /* ================= PDF ================= */

  const generatePdf = async () => {
    if (!fullName || !documentId) {
      showAlert("Debes completar tus datos", "info");
      return;
    }

    if (!signature) {
      showAlert("Debes firmar el documento", "info");
      return;
    }

    try {
      const blob = await pdf(
        <HabeasDataDocument
          signature={signature}
          fullName={fullName}
          documentId={documentId}
        />,
      ).toBlob();

      const pdfBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      await mutateAsync({
        pdfBase64,
        signatureBase64: signature,
        fullName,
        documentId,
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "autorizacion-datos-personales.pdf";
      a.click();

      URL.revokeObjectURL(url);
    } catch {
      showAlert("Error generando el documento", "error");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-8">
      <Title size="lg" font="bold">
        Autorización de Tratamiento de Datos
      </Title>

      <div className="bg-white border rounded-xl p-6 shadow-sm text-sm text-gray-700 max-h-64 overflow-y-auto">
        {HABEAS_DATA_TEXT}
      </div>

      {/* DATOS */}

      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border rounded-lg p-3 w-full"
        />

        <input
          type="text"
          placeholder="Número de documento"
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
          className="border rounded-lg p-3 w-full"
        />
      </div>

      {/* FIRMA */}

      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
        <div className="text-sm text-gray-500">Firma dentro del recuadro</div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="#111827"
            backgroundColor="#ffffff"
            onEnd={handleEnd}
            minWidth={2}
            maxWidth={3}
            canvasProps={{
              width: 600,
              height: 200,
              className: "w-full h-[200px]",
            }}
          />
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            colVariant="danger"
            size="sm"
            onClick={clearSignature}
          >
            Limpiar firma
          </Button>

          <Button
            colVariant="success"
            disabled={isPending || !signature || !fullName || !documentId}
            onClick={generatePdf}
          >
            {isPending ? "Procesando..." : "Aceptar y descargar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
