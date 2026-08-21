import { Modal, Text } from "complexes-next-components";
import React from "react";
import { fileUrl } from "@/app/helpers/fileUrl";

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
  const videoName = videos && videos.length > 0 ? fileUrl(videos[0]) : "";
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-[930px] h-auto z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[900px] max-w-full relative">
        <Text size="xs" font="bold" className="mb-4 text-center">
          Video de la propiedad
        </Text>

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
