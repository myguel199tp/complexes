/* eslint-disable jsx-a11y/alt-text */
"use client";

import React, { useRef, useState, useEffect } from "react";
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

import { Button, InputField, Title } from "complexes-next-components";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useMutationSign } from "./use-sign-mutation";
import { HABEAS_DATA_TEXT } from "./constants";

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

export default function Sign() {
  const sigCanvas = useRef<SignatureCanvasType | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { mutateAsync, isPending } = useMutationSign();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [signature, setSignature] = useState("");
  const [fullName, setFullName] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [canvasWidth, setCanvasWidth] = useState(600);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleEnd = () => {
    if (!sigCanvas.current) return;

    if (sigCanvas.current.isEmpty()) {
      setSignature("");
      return;
    }

    const data = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
    setSignature(data);
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignature("");
  };

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

  const ratio =
    typeof window !== "undefined"
      ? Math.max(window.devicePixelRatio || 1, 1)
      : 1;

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-2xl shadow-xl p-8 space-y-8">
        <div className="space-y-2">
          <Title size="xs" font="bold">
            Autorización de Tratamiento de Datos
          </Title>
          <p className="text-gray-500 text-sm">
            Lee atentamente el documento y firma para aceptar el tratamiento de
            tus datos personales.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-sm text-gray-700 leading-relaxed max-h-72 overflow-y-auto shadow-inner">
          {HABEAS_DATA_TEXT}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">
              Nombre completo
            </label>
            <InputField
              type="text"
              placeholder="Ej: Juan Pérez"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">
              Número de documento
            </label>
            <InputField
              type="text"
              placeholder="Ej: 123456789"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-700">Firma digital</p>
            <p className="text-xs text-gray-400">
              Firma dentro del recuadro usando el mouse o tu dedo.
            </p>
          </div>

          <div
            ref={containerRef}
            className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-[linear-gradient(transparent_24px,#f3f4f6_25px)] bg-[size:100%_25px] hover:border-blue-400 transition"
          >
            <SignatureCanvas
              ref={sigCanvas}
              penColor="#111827"
              backgroundColor="#ffffff"
              onEnd={handleEnd}
              minWidth={2}
              maxWidth={3}
              canvasProps={{
                width: canvasWidth * ratio,
                height: 220 * ratio,
                className: "w-full h-[220px]",
              }}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3 justify-between">
            <Button
              type="button"
              colVariant="danger"
              size="md"
              onClick={clearSignature}
            >
              Limpiar firma
            </Button>

            <Button
              colVariant="success"
              size="md"
              disabled={isPending || !signature || !fullName || !documentId}
              onClick={generatePdf}
            >
              {isPending ? "Procesando..." : "Aceptar y descargar documento"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
