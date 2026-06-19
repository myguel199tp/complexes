import { Modal } from "complexes-next-components";
import React from "react";
import { ExternalPlatformsManager } from "@/app/(panel)/my-external/_components/ExternalPlatformsManager";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hollidayId: string;
}

export default function ModalExternal({
  hollidayId,
  isOpen,
  onClose,
}: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Plataformas externas (Airbnb / Booking / VRBO)"
      className="w-full h-auto md:!w-[1000px]"
    >
      <ExternalPlatformsManager hollidayId={hollidayId} />
    </Modal>
  );
}
