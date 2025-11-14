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
  Buton,
  InputField,
} from "complexes-next-components";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import useFormCertification from "./certification-use-form";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: EnsembleResponse | null;
  title?: string;
}

export enum CertificateType {
  PAZ_Y_SALVO_ADMINISTRACION = "Paz y salvo de administración",
  PAZ_Y_SALVO_CUOTAS_EXTRAORDINARIAS = "Paz y salvo por cuotas extraordinarias",
  PAZ_Y_SALVO_INTERESES_SANCIONES = "Paz y salvo por intereses o sanciones",
  PAZ_Y_SALVO_PARQUEADERO = "Paz y salvo por parqueadero",
  PAZ_Y_SALVO_ARRENDAMIENTO = "Paz y salvo por arrendamiento",
  PAZ_Y_SALVO_GENERAL = "Paz y salvo general",
  PAZ_Y_SALVO_SERVICIOS_COMUNES = "Paz y salvo por servicios comunes",
  PAZ_Y_SALVO_ENTREGA_INMUEBLE = "Paz y salvo por entrega de inmueble",
  CERTIFICADO_RESIDENCIA = "Certificado de residencia",
  CERTIFICADO_VECINDAD = "Certificado de vecindad",
  CERTIFICADO_ARRENDAMIENTO = "Certificado de arrendamiento",
  CERTIFICADO_TENENCIA = "Certificado de tenencia",
  CERTIFICADO_ENTREGA_INMUEBLE = "Certificado de entrega del inmueble",
  CERTIFICADO_NO_SANCIONES = "Certificado de no sanciones",
  CERTIFICADO_BUEN_COMPORTAMIENTO = "Certificado de buen comportamiento",
  CERTIFICADO_CUMPLIMIENTO_REGLAMENTO = "Certificado de cumplimiento del reglamento interno",
  CERTIFICADO_PROPIEDAD_POSESION = "Certificado de propiedad o posesión",
  CERTIFICADO_VENTA_INMUEBLE = "Certificado para venta de inmueble",
  CERTIFICADO_DEUDA = "Certificado de deuda",
  CERTIFICADO_PARTICIPACION_ASAMBLEAS = "Certificado de participación en asambleas",
  CERTIFICADO_COEFICIENTE_COPROPIEDAD = "Certificado de participación porcentual (coeficiente de copropiedad)",
  CERTIFICADO_ACTUALIZACION_DATOS = "Certificado de actualización de datos",
  CONSTANCIA_MANTENIMIENTO_REVISION = "Constancia de mantenimiento o revisión técnica",
  CERTIFICADO_USO_DESTINACION = "Certificado de uso o destinación",
  CERTIFICADO_CONVIVENCIA = "Certificado de convivencia",
  OTRO = "otro",
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
    caracteres.charAt(Math.floor(Math.random() * caracteres.length))
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
    null
  );
  const [customType, setCustomType] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const conjuntoImage = useConjuntoStore((state) => state.conjuntoImage);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const showAlert = useAlertStore((state) => state.showAlert);

  useEffect(() => {
    if (!conjuntoImage) {
      console.log("⚠️ No hay imagen del conjunto todavía");
      return;
    }

    const fetchImageAsBase64 = async () => {
      try {
        const fileName = `${BASE_URL}/uploads/${conjuntoImage.replace(
          /^.*[\\/]/,
          ""
        )}`;
        const encodedUrl = encodeURI(fileName);

        const res = await fetch(encodedUrl, { mode: "cors" });
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

        const blob = await res.blob();

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          if (base64?.startsWith("data:image")) {
            console.log("✅ Imagen convertida a base64 correctamente");
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
  }, [conjuntoImage]); // 👈 clave: depende directamente de conjuntoImage

  // ✅ useForm personalizado
  const { register, handleSubmit, setValue } = useFormCertification(
    String(selectedUser?.id),
    radicado,
    selectedUser?.tower || "",
    selectedUser?.apartment || ""
  );

  console.log("es ui", String(selectedUser?.id));

  const defaultCertificateDescriptions: Record<CertificateType, string> = {
    [CertificateType.PAZ_Y_SALVO_ADMINISTRACION]:
      "Certifica que el propietario se encuentra al día con los pagos de administración.",
    [CertificateType.PAZ_Y_SALVO_CUOTAS_EXTRAORDINARIAS]:
      "Certifica que no presenta deudas por cuotas extraordinarias.",
    [CertificateType.PAZ_Y_SALVO_INTERESES_SANCIONES]:
      "Certifica que no existen intereses o sanciones pendientes.",
    [CertificateType.PAZ_Y_SALVO_PARQUEADERO]:
      "Certifica que el propietario se encuentra al día con los pagos relacionados al parqueadero.",
    [CertificateType.PAZ_Y_SALVO_ARRENDAMIENTO]:
      "Certifica que el arrendatario se encuentra al día con los pagos de arrendamiento.",
    [CertificateType.PAZ_Y_SALVO_GENERAL]:
      "Certifica que no existen deudas pendientes con la copropiedad.",
    [CertificateType.PAZ_Y_SALVO_SERVICIOS_COMUNES]:
      "Certifica que el propietario ha cumplido con los pagos de los servicios comunes.",
    [CertificateType.PAZ_Y_SALVO_ENTREGA_INMUEBLE]:
      "Certifica que el inmueble ha sido entregado a satisfacción y sin deudas.",
    [CertificateType.CERTIFICADO_RESIDENCIA]:
      "Certifica que el residente habita de manera permanente en el conjunto.",
    [CertificateType.CERTIFICADO_VECINDAD]:
      "Certifica que el propietario o residente pertenece a esta comunidad de vecinos.",
    [CertificateType.CERTIFICADO_ARRENDAMIENTO]:
      "Certifica la relación de arrendamiento vigente del inmueble.",
    [CertificateType.CERTIFICADO_TENENCIA]:
      "Certifica la tenencia legal y actual del inmueble.",
    [CertificateType.CERTIFICADO_ENTREGA_INMUEBLE]:
      "Certifica que el inmueble fue entregado conforme a lo establecido.",
    [CertificateType.CERTIFICADO_NO_SANCIONES]:
      "Certifica que el propietario no registra sanciones en la copropiedad.",
    [CertificateType.CERTIFICADO_BUEN_COMPORTAMIENTO]:
      "Certifica el buen comportamiento del residente dentro del conjunto.",
    [CertificateType.CERTIFICADO_CUMPLIMIENTO_REGLAMENTO]:
      "Certifica que el propietario cumple con el reglamento interno.",
    [CertificateType.CERTIFICADO_PROPIEDAD_POSESION]:
      "Certifica la propiedad o posesión legal del inmueble.",
    [CertificateType.CERTIFICADO_VENTA_INMUEBLE]:
      "Certifica el estado del inmueble para fines de venta.",
    [CertificateType.CERTIFICADO_DEUDA]:
      "Certifica el saldo pendiente o las deudas existentes con la copropiedad.",
    [CertificateType.CERTIFICADO_PARTICIPACION_ASAMBLEAS]:
      "Certifica la participación del propietario en las asambleas del conjunto.",
    [CertificateType.CERTIFICADO_COEFICIENTE_COPROPIEDAD]:
      "Certifica el porcentaje de participación del propietario en la copropiedad.",
    [CertificateType.CERTIFICADO_ACTUALIZACION_DATOS]:
      "Certifica la actualización de la información personal y del inmueble.",
    [CertificateType.CONSTANCIA_MANTENIMIENTO_REVISION]:
      "Certifica que se ha realizado el mantenimiento o revisión técnica correspondiente.",
    [CertificateType.CERTIFICADO_USO_DESTINACION]:
      "Certifica el uso o destinación actual del inmueble.",
    [CertificateType.CERTIFICADO_CONVIVENCIA]:
      "Certifica la buena convivencia y armonía del residente dentro del conjunto.",
    [CertificateType.OTRO]:
      "Certificación generada por solicitud especial no contemplada en los tipos anteriores.",
  };

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

  const saveSignature = () => {
    if (sigCanvas.current) {
      const data = sigCanvas.current.toDataURL("image/png");
      setSignatureData(data);
      setIsEmpty(false);
    }
  };

  const handleBegin = () => setIsEmpty(false);
  const handleEnd = () => setIsEmpty(sigCanvas.current?.isEmpty?.() ?? true);

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
              {/* ✅ Usa la imagen Base64 si existe */}
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

  // ✅ Generar PDF, descargarlo y asignarlo al form
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
                defaultOption="Motivo"
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

              {/* 🖊️ Firma */}
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
                <Buton colVariant="warning" onClick={saveSignature}>
                  Guardar firma
                </Buton>
                <Buton onClick={clearSignature}>Limpiar</Buton>
              </div>

              <Buton colVariant="success" onClick={onSubmit}>
                Enviar solicitud
              </Buton>

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
