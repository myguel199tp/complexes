/* eslint-disable jsx-a11y/alt-text */
"use client";

import React, { useEffect, useState } from "react";
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
  Button,
  Text as UiText,
} from "complexes-next-components";
import useForm, { EVIDENCE_MAX_BYTES, EVIDENCE_MIME } from "./use-form";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { fileUrl } from "@/app/helpers/fileUrl";
import { InputField, SelectField, TextAreaField } from "@/app/components/ui/form";
import SignatureField, {
  type SignatureValue,
} from "@/app/components/ui/signature-field/SignatureField";
import { useSaveSignature } from "@/app/components/ui/signature-field/use-saved-signature";

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

const options = Object.values(PetitionType).map((value) => ({
  value,
  label:
    value === "otro"
      ? "Otro (especificar)"
      : value.charAt(0).toUpperCase() + value.slice(1),
}));

function generarRadicado(longitud = 9) {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: longitud }, () =>
    caracteres.charAt(Math.floor(Math.random() * caracteres.length)),
  ).join("");
}

export default function Form() {
  const [signature, setSignature] = useState<SignatureValue | null>(null);
  const [signatureError, setSignatureError] = useState("");
  const saveSignature = useSaveSignature();
  const [radicado] = useState(generarRadicado());
  const [selectedType, setSelectedType] = useState<PetitionType | null>(null);
  const [customType, setCustomType] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);

  const nameUser = useConjuntoStore((state) => state.nameUser);
  const lastName = useConjuntoStore((state) => state.lastName);
  const numberId = useConjuntoStore((state) => state.numberId);
  const conjuntoImage = useConjuntoStore((state) => state.conjuntoImage);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const showAlert = useAlertStore((state) => state.showAlert);

  useEffect(() => {
    if (!conjuntoImage) return;

    const fetchImageAsBase64 = async () => {
      try {
        const fileName = fileUrl(conjuntoImage);
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

  // La vista previa es un object URL: hay que soltarlo al cambiar de foto o
  // al salir, o el blob queda retenido mientras viva la pestaña.
  useEffect(() => {
    if (!evidenceFile) {
      setEvidencePreview(null);
      return;
    }

    const url = URL.createObjectURL(evidenceFile);
    setEvidencePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [evidenceFile]);

  const handleEvidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    // Sin esto, elegir de nuevo la misma foto tras quitarla no dispara onChange.
    e.target.value = "";

    if (!file) return;

    if (!EVIDENCE_MIME.includes(file.type)) {
      showAlert("La imagen debe ser JPG, PNG, WEBP, GIF o HEIC", "info");
      return;
    }

    if (file.size > EVIDENCE_MAX_BYTES) {
      showAlert("La imagen no puede pesar más de 8 MB", "info");
      return;
    }

    setEvidenceFile(file);
    setValue("evidence", file);
  };

  const clearEvidence = () => {
    setEvidenceFile(null);
    setValue("evidence", null);
  };

  const handleSignatureChange = (value: SignatureValue | null) => {
    setSignature(value);
    if (value) setSignatureError("");
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
      upperImage: { width: "40%", height: "50%" },
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
      // `contain`: la firma llega recortada a la tinta y con su proporción.
      signature: {
        width: 180,
        height: 60,
        marginBottom: 5,
        objectFit: "contain",
      },
      name: { fontSize: 12, textAlign: "center" },
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.backgroundWrapper}>
            <Image src="/complex.png" style={styles.backgroundImage} />
          </View>

          <View>
            <View style={styles.header}>
              <Image
                src={imageBase64 || "/complex.png"}
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

            {signature && (
              <View style={styles.signatureContainer}>
                <Image style={styles.signature} src={signature.dataUrl} />
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
    if (!signature) {
      setSignatureError("Firma la solicitud para poder enviarla.");
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
    if (!ready) return;

    // Aparte del envío: si no se guarda, la solicitud sale igual.
    if (signature?.remember) {
      saveSignature.mutate(signature.dataUrl, {
        onError: () =>
          showAlert("No pudimos guardar tu firma para la próxima vez", "info"),
      });
    }

    await handleSubmit();
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col gap-4 mt-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
        <SelectField
          searchable
          sizeHelp="xs"
          inputSize="md"
          rounded="lg"
          defaultOption="Motivo de la pqr"
          helpText="Motivo de la pqr"
          options={options}
          onChange={(e) => handleSelectChange(e.target.value as PetitionType)}
        />

        {selectedType === PetitionType.OTRO && (
          <InputField
            regexType="safeChars"
            type="text"
            helpText="Otro"
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            placeholder="Especifique el motivo"
            value={customType}
            {...register("type")}
            onChange={(e) => setCustomType(e.target.value)}
            className="w-full"
          />
        )}

        <TextAreaField
          placeholder="Descripción"
          {...register("description")}
          value={description}
          className="mt-2 w-full"
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Imagen de prueba{" "}
            <span className="font-normal text-gray-400">(opcional)</span>
          </label>

          {evidencePreview ? (
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={evidencePreview}
                alt="Imagen de prueba"
                className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
              />
              <div className="flex min-w-0 flex-col gap-1 text-xs text-gray-500">
                <span className="truncate">{evidenceFile?.name}</span>
                <button
                  type="button"
                  onClick={clearEvidence}
                  className="self-start text-red-500 hover:underline"
                >
                  Quitar imagen
                </button>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-sm text-gray-500 transition-colors hover:border-cyan-500 hover:text-cyan-700">
              <span>Adjunta una foto como prueba</span>
              <span className="text-xs text-gray-400">
                JPG, PNG o WEBP · máx. 8 MB
              </span>
              <input
                type="file"
                accept={EVIDENCE_MIME.join(",")}
                className="hidden"
                onChange={handleEvidenceChange}
              />
            </label>
          )}

          <p className="text-xs text-gray-500">
            Solo la ven la administración y quien atienda tu solicitud.
          </p>
        </div>

        <SignatureField
          label="Firma del solicitante"
          onChange={handleSignatureChange}
          error={signatureError}
        />

        <Button
          type="button"
          colVariant="success"
          size="full"
          rounded="md"
          className="mt-2 !py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
          onClick={onSubmit}
        >
          Enviar solicitud
        </Button>

        {isSuccess && (
          <UiText size="sm" font="semi" colVariant="success" className="mt-2">
            ✅ Solicitud enviada correctamente
          </UiText>
        )}
      </div>
    </form>
  );
}
