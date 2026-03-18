import React, { useState } from "react";
import { Title, Text } from "complexes-next-components";
import { Pencil, Trash2 } from "lucide-react";
import useCertificationInfo from "./certification-info";
import MessageNotData from "@/app/components/messageNotData";
import ModalEdit from "./modal/modal-edit";
import ModalRemove from "./modal/modal-remove";

export default function CertificationsInfo() {
  const { data, BASE_URL, t } = useCertificationInfo();

  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  const openEdit = (item) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const openRemove = (item) => {
    setSelectedItem(item);
    setIsRemoveOpen(true);
  };

  if (!data?.length) {
    return (
      <div className="text-gray-600 text-center">
        <MessageNotData />
      </div>
    );
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.map((item) => {
          const pdfUrl = `${BASE_URL}/uploads/pdfs/${item.file.replace(
            /^.*[\\/]/,
            "",
          )}`;

          return (
            <div
              key={item.id}
              className="border rounded-2xl p-4 shadow-md bg-white transition hover:shadow-xl flex flex-col relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Title as="h3" className="text-lg font-semibold mb-1">
                    {item.title}
                  </Title>

                  <Text size="sm" className="text-gray-600">
                    {item.nameUnit}
                  </Text>

                  <Text
                    size="sm"
                    font="bold"
                    className={`mb-2 ${
                      item.isPublic ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {item.isPublic ? "Público" : "Privado"}
                  </Text>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
                  >
                    <Pencil size={18} className="text-blue-600" />
                  </button>

                  <button
                    onClick={() => openRemove(item)}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>

              <div className="mt-3 w-full overflow-hidden rounded-lg flex-1">
                <iframe
                  src={pdfUrl}
                  className="w-full h-[250px] rounded-lg"
                  style={{ border: "none" }}
                />
              </div>

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

      <ModalEdit
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        item={selectedItem}
      />

      <ModalRemove
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        onConfirm={() => {
          setIsRemoveOpen(false);
        }}
      />
    </>
  );
}
