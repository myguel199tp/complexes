import React from "react";
import usePqrInfo from "./usePqrInfo";
import { Title, Text } from "complexes-next-components";
import MessageNotData from "@/app/components/messageNotData";

export default function AllInfoPqr() {
  const { data, BASE_URL } = usePqrInfo();

  return (
    <div className="px-4 sm:px-6 lg:px-8 mt-6">
      {!data || data?.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data?.map((item) => {
            const pdfUrl = `${BASE_URL}/uploads/pdfs/${item.file.replace(
              /^.*[\\/]/,
              "",
            )}`;

            return (
              <div
                key={item.id}
                className="border rounded-2xl shadow-lg hover:shadow-2xl transition-all p-4 flex flex-col bg-white"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <Title
                    as="h3"
                    className="text-lg font-semibold text-gray-800 capitalize"
                  >
                    {item.type.replace(/_/g, " ")}
                  </Title>
                  <Text className="text-sm text-gray-500">{item.radicado}</Text>
                </div>

                {/* PDF Preview */}
                <div className="w-full h-[400px] rounded-lg overflow-hidden border">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    style={{ border: "none" }}
                  />
                </div>

                {/* Footer */}
                <div className="mt-3 text-right">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Ver PDF completo
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
