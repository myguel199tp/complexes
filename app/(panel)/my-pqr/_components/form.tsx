/* eslint-disable jsx-a11y/alt-text */
"use client";

import React, { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import {
  Buton,
  Button,
  InputField,
  SelectField,
  TextAreaField,
} from "complexes-next-components";
import useForm from "./use-form";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";

export enum PetitionType {
  TRASTEO = "trasteo",
  SERVICIOS_DOMÉSTICOS = "servicio domestico",
  VISITA = "visita",
  VEHICULO = "vehiculo",
  REPARACION = "reparacion",
  ZONA_COMUN = "zona_comun",
  QUEJA = "queja",
  SUGERENCIAS = "sugerencias",
  PERMISO_ESPECIAL = "Permiso especial",
  PROBLEMAS_TÉCNICOS = "Problemas tecnicos",
  ADMINISTRATIVA = "administrativa",
  AUTORIZACION = "autorizacion",
  OTRO = "otro",
}

// Opciones del select
const options = Object.values(PetitionType).map((value) => ({
  value,
  label:
    value === "otro"
      ? "Otro (especificar)"
      : value.charAt(0).toUpperCase() + value.slice(1),
}));

// Generar radicado aleatorio
function generarRadicado(longitud = 9) {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: longitud }, () =>
    caracteres.charAt(Math.floor(Math.random() * caracteres.length)),
  ).join("");
}

export default function Form() {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const [signatureData, setSignatureData] = useState<string>("");
  const [radicado] = useState(generarRadicado());
  const [isEmpty, setIsEmpty] = useState(true);
  const [strokeCount, setStrokeCount] = useState(0); // Contador de trazos
  const [selectedType, setSelectedType] = useState<PetitionType | null>(null);
  const [customType, setCustomType] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const nameUser = useConjuntoStore((state) => state.nameUser);
  const lastName = useConjuntoStore((state) => state.lastName);
  const numberId = useConjuntoStore((state) => state.numberId);
  const conjuntoImage = useConjuntoStore((state) => state.conjuntoImage);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const showAlert = useAlertStore((state) => state.showAlert);

  useEffect(() => {
    if (!conjuntoImage) return;

    const fetchImageAsBase64 = async () => {
      try {
        const fileName = `${BASE_URL}/uploads/${conjuntoImage.replace(
          /^.*[\\/]/,
          "",
        )}`;
        const encodedUrl = encodeURI(fileName);

        const res = await fetch(encodedUrl, { mode: "cors" });
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          if (base64?.startsWith("data:image")) setImageBase64(base64);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("❌ Error convirtiendo imagen a Base64:", error);
      }
    };

    fetchImageAsBase64();
  }, [BASE_URL, conjuntoImage]);

  const { register, handleSubmit, setValue, isSuccess } = useForm(radicado);

  const defaultDescriptions: Record<PetitionType, string> = {
    [PetitionType.SERVICIOS_DOMÉSTICOS]:
      "Solicitud de ingreso para personal de servicio doméstico...",
    [PetitionType.TRASTEO]:
      "Solicitud de autorización para realizar un trasteo...",
    [PetitionType.VISITA]: "Registro de visita...",
    [PetitionType.VEHICULO]: "Solicitud relacionada con vehículos...",
    [PetitionType.REPARACION]: "Petición para realizar reparación...",
    [PetitionType.ZONA_COMUN]:
      "Solicitud de uso o mantenimiento de zona común...",
    [PetitionType.QUEJA]: "Presento una queja formal...",
    [PetitionType.SUGERENCIAS]: "Propongo la siguiente sugerencia...",
    [PetitionType.PERMISO_ESPECIAL]: "Solicitud de permiso especial...",
    [PetitionType.PROBLEMAS_TÉCNICOS]: "Reporte de inconvenientes técnicos...",
    [PetitionType.ADMINISTRATIVA]: "Solicitud administrativa...",
    [PetitionType.AUTORIZACION]: "Solicitud de autorización...",
    [PetitionType.OTRO]: "",
  };

  const handleSelectChange = (value: PetitionType) => {
    setSelectedType(value);
    setValue("type", value);
    if (value === PetitionType.OTRO) {
      setDescription("");
      setCustomType("");
    } else {
      setDescription(defaultDescriptions[value]);
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignatureData("");
    setIsEmpty(true);
    setStrokeCount(0);
  };

  // Firma automática con mínimo 2 trazos
  const handleBegin = () => setStrokeCount((prev) => prev + 1);
  const handleEnd = () => {
    const empty = sigCanvas.current?.isEmpty() ?? true;
    setIsEmpty(empty || strokeCount < 2);

    if (!empty) {
      const data = sigCanvas.current!.toDataURL("image/png");
      setSignatureData(data);
    }
  };

  const MyDocument = () => {
    const styles = StyleSheet.create({
      page: { position: "relative", padding: 50 },
      backgroundWrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
      },
      backgroundImage: { width: "100%", height: "100%", opacity: 0.08 },
      upperImage: { width: "30%", height: "40%" },
      header: {
        marginBottom: 40,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
      },
      title: { fontSize: 20, fontWeight: "bold" },
      radicado: { fontSize: 12, textAlign: "right" },
      section: { marginBottom: 20, lineHeight: 1.6 },
      signatureContainer: { marginTop: 60, alignItems: "center" },
      signature: { width: 140, height: 50, marginBottom: 5 },
      name: { fontSize: 12, textAlign: "center" },
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.backgroundWrapper}>
            <Image src="/complex.jpg" style={styles.backgroundImage} />
          </View>

          <View>
            <View style={styles.header}>
              <Image
                src={imageBase64 || "/complex.jpg"}
                style={styles.upperImage}
              />
              <Text style={styles.title}>
                {selectedType === PetitionType.OTRO
                  ? customType || "Otro"
                  : selectedType}
              </Text>
              <Text style={styles.radicado}>Radicado: {radicado}</Text>
            </View>

            <View style={styles.section}>
              {description && <Text>{description}</Text>}
            </View>

            {signatureData && (
              <View style={styles.signatureContainer}>
                <Image style={styles.signature} src={signatureData} />
                <Text style={styles.name}>______________________________</Text>
                <Text style={styles.name}>
                  {nameUser} {lastName}
                </Text>
                <Text style={styles.name}>{numberId}</Text>
              </View>
            )}
          </View>
        </Page>
      </Document>
    );
  };

  const handleGeneratePdf = async () => {
    if (!signatureData) {
      showAlert("¡Por favor, agrega tu firma antes de enviar!", "info");
      return false;
    }

    const blob = await pdf(<MyDocument />).toBlob();
    const file = new File([blob], `${radicado}.pdf`, {
      type: "application/pdf",
    });
    setValue("file", file);
    setValue("radicado", radicado);
    setValue("description", description);

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${radicado}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    return true;
  };

  const onSubmit = async () => {
    const ready = await handleGeneratePdf();
    if (ready) await handleSubmit();
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col gap-4 mt-2">
        <SelectField
          helpText="Motivo"
          searchable
          sizeHelp="xs"
          inputSize="sm"
          rounded="lg"
          defaultOption="Motivo"
          options={options}
          onChange={(e) => handleSelectChange(e.target.value as PetitionType)}
        />

        {selectedType === PetitionType.OTRO && (
          <InputField
            type="text"
            helpText="Otro"
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            placeholder="Especifique el motivo"
            value={customType}
            {...register("type")}
            onChange={(e) => setCustomType(e.target.value)}
            className="w-full rounded-md border bg-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        <TextAreaField
          placeholder="Descripción"
          {...register("description")}
          value={description}
          className="bg-gray-200"
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Firma */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Firma del solicitante
          </label>

          <div
            className="relative rounded-xl border-2 border-dashed border-cyan-500 bg-gray-50 overflow-hidden"
            style={{
              width: 420,
              height: 180,
              touchAction: "none", // 🔥 CLAVE
            }}
          >
            <SignatureCanvas
              ref={sigCanvas}
              penColor="#111827"
              onBegin={handleBegin}
              onEnd={handleEnd}
              canvasProps={{
                width: 420,
                height: 180,
                className: "sig-canvas cursor-crosshair bg-transparent",
              }}
            />

            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-sm select-none">
                Firma aquí (mínimo 2 trazos)
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Dibuja con el mouse o con el dedo</span>
            <button
              type="button"
              onClick={clearSignature}
              className="text-red-500 hover:underline"
            >
              Limpiar firma
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Buton
            rounded="sm"
            borderWidth="none"
            colVariant="danger"
            onClick={clearSignature}
          >
            Limpiar
          </Buton>
        </div>

        <Button colVariant="warning" size="full" onClick={onSubmit}>
          Enviar solicitud
        </Button>

        {isSuccess && (
          <p className="text-green-600 font-semibold mt-2">
            ✅ Solicitud enviada correctamente
          </p>
        )}

        <style jsx>{`
          .sig-canvas {
            border: 2px dashed #3b82f6;
            border-radius: 12px;
            background: #f9fafb;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
    </form>
  );
}
