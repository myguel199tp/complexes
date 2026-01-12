import React from "react";
import usePqrInfo from "./usePqrInfo";
import { Title, Text } from "complexes-next-components";
import MessageNotData from "@/app/components/messageNotData";

export default function AllInfoPqr() {
  const { data, BASE_URL } = usePqrInfo();

  return (
    <div className="px-4 sm:px-6 lg:px-8 mt-6">
      {!data || data.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((item) => {
            const pdfUrl = `${BASE_URL}/uploads/pdfs/${item.file.replace(
              /^.*[\\/]/,
              ""
            )}`;

            return (
              <div
                key={item.id}
                className="border rounded-2xl shadow-xl bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-shadow p-5 flex flex-col"
              >
                {/* Título */}
                <div className="flex items-center justify-between">
                  <Title
                    as="h3"
                    className="text-xl font-semibold mb-4 text-gray-800 capitalize"
                  >
                    {item.type.replace(/_/g, " ")}
                  </Title>
                  <Text>{item.radicado}</Text>
                </div>

                {/* Vista previa PDF */}
                <div className="flex-grow overflow-hidden rounded-lg border border-gray-300">
                  <div className="scale-[1.3] origin-top">
                    <iframe
                      src={pdfUrl}
                      className="w-full h-[500px] rounded-lg"
                      style={{
                        border: "none",
                        transform: "scale(1.4)",
                        transformOrigin: "top center",
                        width: "125%",
                        height: "600px",
                      }}
                    />
                  </div>
                </div>

                {/* Enlace */}
                <div className="mt-3 text-right">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
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
