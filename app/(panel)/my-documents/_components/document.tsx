"use client";

import { t } from "i18next";
import React, { useEffect, useState } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { Title, Text } from "complexes-next-components";
import { DocumentResponse } from "../service/response/documentResponse";
import { allDocumentService } from "../service/documentallService";
import MessageNotData from "@/app/components/messageNotData";

export default function DocumentsInfo() {
  const [data, setData] = useState<DocumentResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  // URL base (local o prod)
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      if (!conjuntoId) return;
      try {
        const result = await allDocumentService(conjuntoId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errorDesconocido"));
      }
    };
    fetchData();
  }, [conjuntoId]);

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
    <div
      className="
        px-4 sm:px-6 lg:px-8 mt-4
        grid grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-4
      "
    >
      {data.map((item) => {
        const pdfUrl = `${BASE_URL}/uploads/pdfs/${item.file.replace(
          /^.*[\\/]/,
          "",
        )}`;

        return (
          <div
            key={item.id}
            className="
              border rounded-lg p-4
              shadow-2xl bg-transparent
              transition hover:shadow-lg
              flex flex-col
            "
          >
            <Title as="h3" className="text-lg sm:text-xl font-semibold">
              {item.title}
            </Title>

            <Text size="sm" className="text-gray-700">
              {item.nameUnit}
            </Text>

            <Text size="sm" font="bold" className="text-gray-900">
              {item.isPublic ? "Público" : "Privado"}
            </Text>

            {/* Vista previa del PDF */}
            <div className="mt-4 w-full overflow-hidden rounded-lg flex-1">
              <iframe
                src={pdfUrl}
                className="w-full h-[300px] rounded-lg"
                style={{ border: "none" }}
              />
            </div>

            {/* Enlace */}
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
