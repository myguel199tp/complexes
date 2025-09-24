/* eslint-disable jsx-a11y/alt-text */
import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { Buton, SelectField } from "complexes-next-components";

// Función para generar radicado aleatorio de 9 caracteres
function generarRadicado(longitud = 9) {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let resultado = "";
  for (let i = 0; i < longitud; i++) {
    resultado += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
  }
  return resultado;
}

export default function Form() {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [signatureData, setSignatureData] = useState<string>("");
  const [radicado] = useState(generarRadicado()); // Genera un radicado al cargar el componente
  const [isEmpty, setIsEmpty] = useState(true);

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

  // Documento PDF
  const MyDocument = () => {
    const styles = StyleSheet.create({
      page: {
        flexDirection: "column",
        padding: 20,
      },
      section: {
        marginBottom: 10,
        padding: 10,
      },
      title: {
        fontSize: 20,
        marginBottom: 10,
      },
      radicado: {
        fontSize: 16,
        marginTop: 10,
      },
      signature: {
        marginTop: 20,
        width: 300,
        height: 100,
      },
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.title}>Formulario con Firma</Text>
            <Text>Contenido del formulario...</Text>
            <Text style={styles.radicado}>Radicado: {radicado}</Text>

            {signatureData && (
              <Image style={styles.signature} src={signatureData} />
            )}
          </View>
        </Page>
      </Document>
    );
  };

  return (
    <div>
      <SelectField
        className="bg-transparent text-gray-400"
        defaultOption="Motivo"
        helpText="Motivo"
        sizeHelp="sm"
        options={[]}
        inputSize="lg"
      />

      <textarea
        placeholder="descripción"
        className="mt-2 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={4}
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
        {/* Placeholder encima del canvas */}
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 bg-white text-sm select-none">
            Firma aquí
          </div>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <Buton onClick={saveSignature} size="sm" borderWidth="thin">
          Guardar firma
        </Buton>
        <Buton
          size="sm"
          borderWidth="thin"
          onClick={clearSignature}
          style={{ marginLeft: 10 }}
        >
          Limpiar
        </Buton>
      </div>

      {signatureData && (
        <div style={{ marginTop: 20 }}>
          <PDFDownloadLink
            document={<MyDocument />}
            fileName={`${radicado}.pdf`} // usa el radicado como nombre del PDF
          >
            {({ loading }) => (
              <button>
                {loading ? "Generando PDF..." : "Ver / Descargar PDF"}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      )}

      {/* Estilos para el canvas */}
      <style jsx>{`
        .sig-canvas {
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
        }
      `}</style>
    </div>
  );
}
