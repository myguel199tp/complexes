import React from "react";
import { Title, Text } from "complexes-next-components";
import useCertificationInfo from "./certification-info";
import MessageNotData from "@/app/components/messageNotData";

export default function CertificationsInfo() {
  const { data, BASE_URL, t } = useCertificationInfo();

  if (!data.length) {
    return (
      <div className="text-gray-600 text-center">
        <MessageNotData />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((item) => {
        const pdfUrl = `${BASE_URL}/uploads/pdfs/${item.file.replace(
          /^.*[\\/]/,
          ""
        )}`;

        return (
          <div
            key={item.id}
            className="border rounded-xl p-4 shadow-md bg-white transition hover:shadow-xl flex flex-col"
          >
            <Title as="h3" className="text-lg font-semibold mb-1">
              {item.title}
            </Title>

            <Text size="sm" className="text-gray-600">
              {item.nameUnit}
            </Text>

            <Text size="sm" font="bold" className="text-gray-900 mb-2">
              {item.isPublic ? "Público" : "Privado"}
            </Text>

            {/* PDF */}
            <div className="mt-3 w-full overflow-hidden rounded-lg flex-1">
              <iframe
                src={pdfUrl}
                className="w-full h-[250px] rounded-lg"
                style={{ border: "none" }}
              />
            </div>

            {/* Link */}
            <div className="mt-3">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
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
