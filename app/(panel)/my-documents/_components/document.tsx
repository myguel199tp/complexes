"use client";

import { t } from "i18next";
import React, { useEffect, useState } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { Title, Text } from "complexes-next-components";
import { DocumentResponse } from "../service/response/documentResponse";
import { allDocumentService } from "../service/documentallService";
import MessageNotData from "@/app/components/messageNotData";
import { FiFileText, FiExternalLink } from "react-icons/fi";

export default function DocumentsInfo() {
  const [data, setData] = useState<DocumentResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  if (!data?.length) {
    return (
      <div className="text-gray-600 text-center py-10">
        <MessageNotData />
      </div>
    );
  }

  return (
    <div
      className="
        px-4 sm:px-6 lg:px-10 mt-6
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        gap-6
      "
    >
      {data?.map((item) => {
        const pdfUrl = `${BASE_URL}/uploads/pdfs/${item.file.replace(
          /^.*[\\/]/,
          "",
        )}`;

        return (
          <div
            key={item.id}
            className="
              bg-white
              rounded-xl
              border
              shadow-sm
              hover:shadow-xl
              transition-all
              duration-300
              flex flex-col
              overflow-hidden
            "
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
              <FiFileText className="text-blue-600 text-xl" />

              <div className="flex flex-col">
                <Title
                  as="h3"
                  className="text-base font-semibold leading-tight"
                >
                  {item.title}
                </Title>

                <Text size="sm" className="text-gray-500">
                  {item.nameUnit}
                </Text>
              </div>
            </div>

            {/* Badge */}
            <div className="px-4 pt-3">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  item.isPublic
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {item.isPublic ? "Público" : "Privado"}
              </span>
            </div>

            {/* PDF preview */}
            <div className="p-4 flex-1">
              <div className="rounded-lg overflow-hidden border">
                <iframe
                  src={pdfUrl}
                  className="w-full h-[250px]"
                  style={{ border: "none" }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center justify-center gap-2
                  w-full
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  text-sm
                  font-medium
                  py-2.5
                  rounded-lg
                  transition
                "
              >
                <FiExternalLink />
                {t("verPdf")}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
