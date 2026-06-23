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
  Modal,
  SelectField,
  InputField,
  Button,
} from "complexes-next-components";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import useFormCertification from "./certification-use-form";
import { CertificateType, defaultCertificateDescriptions } from "./constants";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: EnsembleResponse | null;
  title?: string;
}

const options = Object.values(CertificateType).map((value) => ({
  value,
  label:
    value === "otro"
      ? "Otro (especificar)"
      : value.charAt(0).toUpperCase() + value.slice(1),
}));

function generarRadicado(longitud = 5) {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: longitud }, () =>
    caracteres.charAt(Math.floor(Math.random() * caracteres.length)),
  ).join("");
}

export default function ModalCertification({
  isOpen,
  onClose,
  selectedUser,
  title = "Certificaciones",
}: Props) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const [signatureData, setSignatureData] = useState<string>("");
  const [radicado] = useState(generarRadicado());
  const [isEmpty, setIsEmpty] = useState(true);
  const [selectedType, setSelectedType] = useState<CertificateType | null>(
    null,
  );
  const [customType, setCustomType] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const conjuntoImage = useConjuntoStore((state) => state.conjuntoImage);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const showAlert = useAlertStore((state) => state.showAlert);

  const { register, handleSubmit, setValue } = useFormCertification(
    "",
    "",
    radicado,
    "",
    "",
  );

  const handleSelectChange = (value: CertificateType) => {
    setSelectedType(value);
    setValue("type", value);
    if (value === CertificateType.OTRO) {
      setDescription("");
      setCustomType("");
    } else {
      setDescription(defaultCertificateDescriptions[value]);
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignatureData("");
    setIsEmpty(true);
  };

  const handleBegin = () => setIsEmpty(false);
  const handleEnd = () => {
    const empty = sigCanvas.current?.isEmpty?.() ?? true;

    setIsEmpty(empty);

    if (!empty && sigCanvas.current) {
      const data = sigCanvas.current.toDataURL("image/png");
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

    useEffect(() => {
      if (!conjuntoImage) {
        return;
      }

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
            if (base64?.startsWith("data:image")) {
              setImageBase64(base64);
            } else {
              console.warn("⚠️ No parece ser una imagen base64 válida");
            }
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error("❌ Error convirtiendo imagen a Base64:", error);
        }
      };

      fetchImageAsBase64();
    }, []);

    useEffect(() => {
      if (selectedUser) {
        setValue("relationId", String(selectedUser.id));
        setValue("iduser", String(selectedUser.user?.id));
        setValue("tower", selectedUser.tower || "");
        setValue("apartment", selectedUser.apartment || "");
      }
    }, []);

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
                {selectedType === CertificateType.OTRO
                  ? customType || "otro"
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
                  {selectedUser?.user.name} {selectedUser?.user.lastName}
                </Text>
                <Text style={styles.name}>{selectedUser?.user.numberId}</Text>
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

    if (ready) {
      await handleSubmit();

      onClose(); // 👈 cierra el modal
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="w-[1200px] h-auto"
    >
      {selectedUser ? (
        <div className="space-y-2">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-4 mt-4">
              <SelectField
                helpText="Motivo"
                defaultOption="Motivo"
                inputSize="md"
                options={options}
                onChange={(e) =>
                  handleSelectChange(e.target.value as CertificateType)
                }
              />

              {selectedType === CertificateType.OTRO && (
                <InputField
                  type="text"
                  placeholder="Especifique el motivo"
                  value={customType}
                  {...register("type")}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

              <textarea
                placeholder="Descripción"
                {...register("description")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 w-full min-h-[200px] rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <div style={{ position: "relative", width: 400, height: 150 }}>
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  onBegin={handleBegin}
                  onEnd={handleEnd}
                  canvasProps={{
                    width: 400,
                    height: 150,
                    className: "sig-canvas",
                  }}
                />
                {isEmpty && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 bg-white text-sm select-none">
                    Firma aquí
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  colVariant="danger"
                  onClick={clearSignature}
                >
                  Limpiar
                </Button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" colVariant="default" size="sm" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" colVariant="success" size="sm" onClick={onSubmit}>
                  Enviar solicitud
                </Button>
              </div>

              <style jsx>{`
                .sig-canvas {
                  border: 1px dashed #cbd5e1;
                  border-radius: 8px;
                  background: #ffffff;
                }
              `}</style>
            </div>
          </form>
        </div>
      ) : (
        <div className="py-4">No hay propietario seleccionado</div>
      )}
    </Modal>
  );
}
