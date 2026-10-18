"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Text } from "complexes-next-components";
import {
  LocationPicker,
  MapPoint,
  placeSearchQueries,
} from "@/app/components/ui/location-picker";
import { ComercioBranch } from "../services/comercioBranchService";

interface Props {
  /** La sucursal que se está ubicando, o `null` con el modal cerrado. */
  branch: ComercioBranch | null;
  saving: boolean;
  onClose: () => void;
  onSave: (point: MapPoint) => void;
}

/** El Modal de la librería es blanco en los dos temas: colores claros-sobre-blanco. */
export default function BranchLocationModal({ branch, saving, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<MapPoint | null>(null);

  useEffect(() => {
    setDraft(
      branch?.latitude != null && branch.longitude != null
        ? { latitude: branch.latitude, longitude: branch.longitude }
        : null,
    );
  }, [branch]);

  const approximate = !!branch?.locationSource && branch.locationSource !== "pin";

  return (
    <Modal
      isOpen={!!branch}
      onClose={onClose}
      title={branch ? `Ubicación de ${branch.name}` : "Ubicación"}
      className="!w-[94%] md:!w-[760px] max-w-[96vw] max-h-[90vh] overflow-y-auto"
    >
      {branch && (
        <div className="space-y-4 p-2">
          <Text size="sm" className="text-gray-600">
            {branch.address}
            {branch.neighborhood ? ` · ${branch.neighborhood}` : ""} · {branch.city}
          </Text>
          {approximate && (
            <Text size="xs" className="text-amber-700">
              Esta ubicación salió de la dirección y es aproximada. Mueve el pin a
              la entrada y guárdala.
            </Text>
          )}

          <LocationPicker
            value={draft}
            onChange={setDraft}
            center={null}
            centerQuery={[branch.city.replace(/\s*\([^()]*\)\s*$/, ""), branch.country]
              .filter(Boolean)
              .join(", ")}
            searchQueries={placeSearchQueries(branch)}
          />

          <div className="flex justify-end">
            <Button
              colVariant="success"
              size="sm"
              disabled={!draft || saving}
              onClick={() => draft && onSave(draft)}
            >
              {saving ? "Guardando..." : "Guardar ubicación"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
