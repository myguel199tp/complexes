import React from "react";
import { Title, Text } from "complexes-next-components";
import useCertificationInfo from "./certification-info";
import MessageNotData from "@/app/components/messageNotData";

export default function CertificationsInfo() {
  const { data, error, BASE_URL, t } = useCertificationInfo();

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!data.length) {
    return (
      <div className="text-gray-600 text-center">
        <MessageNotData />
      </div>
    );
  }

  return (
    <div className=" px-4 sm:px-6 lg:px-8 block md:!flex gap-4 mt-4">
      {data.map((item) => {
        // Aseguramos que el archivo tenga la ruta completa
        const pdfUrl = `${BASE_URL}/uploads/pdfs/${item.file.replace(
          /^.*[\\/]/,
          ""
        )}`;

        return (
          <div
            key={item.id}
            className="border rounded-lg p-4 shadow-2xl bg-transparent w-full md:w-1/2 transition hover:shadow-lg"
          >
            <Title as="h3" className="text-lg sm:text-xl font-semibold">
              {item.title}
            </Title>
            <Text size="sm" className="text-gray-700">
              {item.nameUnit}
            </Text>
            <Text size="sm" font="bold" className="text-gray-900">
              {item.isPublic === true ? "Público" : "Privado"}
            </Text>

            {/* Vista previa del PDF responsive */}
            <div className="mt-4 w-full overflow-hidden rounded-lg">
              <iframe
                src={pdfUrl}
                className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-lg"
                style={{ border: "none" }}
              ></iframe>
            </div>

            {/* Enlace para abrir en otra pestaña */}
            <div className="mt-3">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm sm:text-base"
              >
                {t("verPdf")}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
