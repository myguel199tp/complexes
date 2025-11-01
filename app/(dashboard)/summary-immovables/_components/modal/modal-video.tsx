import { Button, Modal, Text } from "complexes-next-components";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  videos?: string[];
  videoUrl?: string;
}

export default function ModalVideo({
  isOpen,
  onClose,
  videos,
  videoUrl,
}: Props) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const videoName =
    videos && videos.length > 0
      ? `${BASE_URL}/uploads/${videos[0].replace(/^.*[\\/]/, "")}`
      : "";
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-[930px] h-auto">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[900px] max-w-full relative">
        <Text size="xs" font="bold" className="mb-4 text-center">
          Video de la propiedad
        </Text>

        {/* Renderiza solo si existe videos (archivo subido localmente) */}
        {videos?.length ? (
          <video
            controls
            className="w-full max-w-3xl mx-auto rounded-lg shadow-lg"
            src={videoName}
          />
        ) : videoUrl ? (
          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
            <iframe
              src={videoUrl.replace("watch?v=", "embed/")}
              title="Video de la propiedad"
              className="absolute top-0 left-0 w-full h-full"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <Text className="text-center text-gray-500">
            No hay video disponible
          </Text>
        )}
      </div>
    </Modal>
  );
}
