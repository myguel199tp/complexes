/* eslint-disable jsx-a11y/alt-text */
"use client";

import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";
import { Button } from "complexes-next-components";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useMutationHabeas } from "./useMutationHabeas";

/* ================= PDF STYLES ================= */

const HABEAS_DATA_TEXT = `
AUTORIZACIÓN INTEGRAL, AMPLIA, IRREVOCABLE (EN LO PERMITIDO POR LA LEY) Y
EXPRESA PARA EL TRATAMIENTO DE DATOS PERSONALES, USO DE PLATAFORMAS DIGITALES
Y SISTEMAS TECNOLÓGICOS

De conformidad con lo establecido en la Ley 1581 de 2012, el Decreto 1377 de 2013,
el Decreto 1074 de 2015, la Ley 1266 de 2008, las Circulares Externas de la
Superintendencia de Industria y Comercio, y demás normas concordantes que regulan
la protección de datos personales en la República de Colombia, autorizo de manera
libre, previa, expresa, voluntaria e informada a COMPLEXESPH, al conjunto
residencial, a su administración, a sus representantes legales, operadores,
desarrolladores, aliados estratégicos y proveedores tecnológicos, en calidad de
RESPONSABLES y/o ENCARGADOS del tratamiento, para recolectar, almacenar, usar,
procesar, analizar, circular, actualizar, transmitir, transferir, suprimir,
anonimizar y en general realizar cualquier operación sobre mis datos personales.

ALCANCE DE LOS DATOS AUTORIZADOS

La presente autorización comprende, sin limitarse, al tratamiento de datos
personales de naturaleza pública, privada, semiprivada y sensible, tales como:
datos de identificación, contacto, información residencial, datos financieros,
registros contables, información contractual, imágenes, grabaciones de audio y
video, biometría, firmas manuscritas y electrónicas, registros de acceso físico
y digital, información generada por sensores, cámaras, dispositivos de seguridad,
direcciones IP, geolocalización, historiales de uso, metadatos, registros de
actividad, interacciones dentro de la plataforma, mensajes, archivos cargados,
datos derivados, inferidos o generados mediante sistemas de analítica, inteligencia
artificial o automatización.

FINALIDADES AMPLIADAS DEL TRATAMIENTO

Mis datos personales podrán ser tratados para todas las finalidades necesarias
y relacionadas directa o indirectamente con la operación del conjunto residencial
y de la plataforma ComplexesPH, incluyendo pero no limitándose a:

• Control, verificación y validación de identidad.
• Seguridad física, digital y lógica del conjunto residencial.
• Registro, control y trazabilidad de accesos, ingresos, salidas y actividades.
• Administración integral del conjunto, incluyendo gestión jurídica,
  contable, financiera, presupuestal, contractual y operativa.
• Facturación, recaudo, gestión de cartera, cobros, pagos y reportes internos.
• Atención, gestión y seguimiento de solicitudes, PQRS, procesos disciplinarios
  internos y actuaciones administrativas.
• Comunicación por cualquier canal físico o digital disponible.
• Operación, mantenimiento, soporte, auditoría y mejora continua de la
  plataforma tecnológica.
• Uso de inteligencia artificial, sistemas automáticos, asistentes virtuales,
  algoritmos y modelos predictivos para optimizar procesos y atención.
• Elaboración de reportes, estadísticas, análisis de comportamiento y
  toma de decisiones.
• Almacenamiento en servidores propios o de terceros, en la nube o infraestructuras
  distribuidas, dentro o fuera del territorio colombiano.
• Transferencia y transmisión de datos a proveedores, autoridades, entidades
  judiciales, aseguradoras, entidades financieras y terceros necesarios para
  cumplir obligaciones legales o contractuales.
• Conservación de registros digitales como evidencia ante procesos judiciales,
  administrativos o disciplinarios.
• Cumplimiento de obligaciones legales, regulatorias, contractuales y
  requerimientos de autoridades competentes.

EXONERACIÓN Y LIMITACIÓN DE RESPONSABILIDAD

El titular declara conocer y aceptar que COMPLEXESPH actúa como plataforma
tecnológica de apoyo a la administración, por lo cual no será responsable por:
• El uso indebido de credenciales por parte del titular o terceros autorizados.
• Errores derivados de información suministrada de forma incorrecta,
  incompleta o desactualizada por el titular.
• Fallas tecnológicas atribuibles a terceros proveedores de infraestructura,
  conectividad o servicios en la nube, salvo dolo o culpa grave comprobada.
• Decisiones administrativas tomadas con base en la información registrada
  por los usuarios.

DERECHOS DEL TITULAR

Declaro conocer que, como titular de la información, tengo derecho a:
• Acceder, conocer, actualizar y rectificar mis datos.
• Solicitar prueba de esta autorización.
• Ser informado sobre el uso de mis datos.
• Presentar consultas, quejas o reclamos ante el responsable.
• Revocar la autorización y solicitar la supresión de los datos, salvo cuando
  exista deber legal, contractual o interés legítimo que lo impida.
• Acudir ante la Superintendencia de Industria y Comercio.

SEGURIDAD DE LA INFORMACIÓN

COMPLEXESPH implementará medidas técnicas, administrativas y organizacionales
razonables para proteger la información, sin que ello implique garantía absoluta
frente a ataques informáticos, accesos no autorizados o eventos de fuerza mayor.

VIGENCIA Y CONSERVACIÓN

Esta autorización tendrá vigencia indefinida mientras exista relación directa o
indirecta con el conjunto residencial o la plataforma, y podrá extenderse aun
después de terminada dicha relación, mientras sea necesario para fines legales,
probatorios, históricos, contables o de seguridad.

ACEPTACIÓN

La aceptación de este documento, el registro en la plataforma, el uso de los
servicios o la firma física o electrónica, constituyen manifestación inequívoca
de consentimiento informado, total y sin reservas.
`;

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

const HabeasDataDocument = ({
  signature,
  fullName,
  documentId,
}: {
  signature: string;
  fullName: string;
  documentId: string;
}) => (
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
        <Image src={signature} style={styles.signatureImage} />
        <Text>{fullName}</Text>
        <Text>{documentId}</Text>
      </View>
    </Page>
  </Document>
);
/* ================= COMPONENT ================= */

export default function ProteccionDatos() {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const { mutateAsync, isPending } = useMutationHabeas();

  const [signature, setSignature] = useState("");
  const [strokeCount, setStrokeCount] = useState(0);
  const [isEmpty, setIsEmpty] = useState(true);

  const showAlert = useAlertStore((s) => s.showAlert);

  /* ================= FIRMA ================= */

  const handleBegin = () => {
    setStrokeCount((prev) => prev + 1);
  };

  const handleEnd = () => {
    const empty = sigCanvas.current?.isEmpty() ?? true;

    if (empty || strokeCount < 2) {
      setIsEmpty(true);
      return;
    }

    setIsEmpty(false);

    const dataUrl = sigCanvas.current!.toDataURL("image/png");
    setSignature(dataUrl);
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignature("");
    setStrokeCount(0);
    setIsEmpty(true);
  };

  /* ================= PDF ================= */

  const generatePdf = async () => {
    if (!signature) {
      showAlert("Debes firmar para continuar", "info");
      return;
    }

    try {
      const blob = await pdf(
        <HabeasDataDocument
          signature={signature}
          fullName="Nombre de prueba"
          documentId="123456789"
        />,
      ).toBlob();

      // 🔁 PDF → base64
      const pdfBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // 🚀 Guardar en backend
      await mutateAsync({
        pdfBase64,
        signatureBase64: signature,
        fullName: "Nombre de prueba",
        documentId: "123456789",
      });

      // 📥 Descargar local (opcional)
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "autorizacion-datos-personales.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error(error);
      showAlert("Error al procesar la autorización", "error");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-6">
      <h1 className="text-xl font-semibold">
        Autorización de Protección de Datos
      </h1>

      <p className="text-sm text-gray-600">
        Lee el documento completo y firma para continuar.
      </p>

      {/* TEXTO LEGAL */}
      <div className="max-h-64 overflow-y-auto rounded-lg border bg-white p-4 text-sm text-gray-700 leading-relaxed">
        {HABEAS_DATA_TEXT}
      </div>

      {/* FIRMA */}
      <div className="space-y-2">
        <div
          className="relative rounded-xl border-2 border-dashed border-cyan-500 bg-gray-50"
          style={{ width: 420, height: 180, touchAction: "none" }}
        >
          <SignatureCanvas
            ref={sigCanvas}
            penColor="#111827"
            onBegin={handleBegin}
            onEnd={handleEnd}
            canvasProps={{
              width: 420,
              height: 180,
              className: "cursor-crosshair",
            }}
          />

          {isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">
              Firma aquí (mínimo 2 trazos)
            </div>
          )}
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>Firma con el mouse o el dedo</span>
          <button
            type="button"
            onClick={clearSignature}
            className="text-red-500 hover:underline"
          >
            Limpiar firma
          </button>
        </div>
      </div>

      {/* BOTÓN */}
      <Button
        colVariant="success"
        size="full"
        disabled={isPending}
        onClick={generatePdf}
      >
        {isPending ? "Procesando..." : "Aceptar y descargar autorización"}
      </Button>
    </div>
  );
}
