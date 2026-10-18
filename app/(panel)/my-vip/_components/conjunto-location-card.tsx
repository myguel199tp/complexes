"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Text } from "complexes-next-components";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  LocationPicker,
  MapPoint,
  placeSearchQueries,
} from "@/app/components/ui/location-picker";
import {
  ConjuntoLocation,
  ConjuntoLocationStatus,
  clearConjuntoLocation,
  getConjuntoLocation,
  setConjuntoLocation,
} from "../services/conjuntoLocationService";

const CONJUNTO_LOCATION_QUERY = "conjunto-location";

const STATUS_TEXT: Record<ConjuntoLocationStatus, string> = {
  pin: "Ubicación confirmada en el mapa.",
  approximate:
    "Ubicación aproximada, sacada de la dirección. Confírmala poniendo el pin en la entrada.",
  pending: "Estamos buscando la dirección en el mapa; tarda alrededor de un minuto.",
  not_found:
    "No encontramos la dirección en el mapa. Márcala tú para que los comercios cercanos puedan ubicarte.",
};

const STATUS_COLOR: Record<ConjuntoLocationStatus, string> = {
  pin: "text-green-700",
  approximate: "text-amber-700",
  pending: "text-gray-500",
  not_found: "text-red-700",
};

/**
 * Dónde queda el conjunto. La ve y la cambia la administración; con ella se
 * mide la distancia a los comercios, que antes solo se sabía por ciudad.
 */
export default function ConjuntoLocationCard() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MapPoint | null>(null);

  const query = useQuery({
    queryKey: [CONJUNTO_LOCATION_QUERY, conjuntoId],
    queryFn: () => getConjuntoLocation(conjuntoId),
    enabled: !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const onSaved = (location: ConjuntoLocation) => {
    queryClient.setQueryData([CONJUNTO_LOCATION_QUERY, conjuntoId], location);
    setOpen(false);
  };

  const save = useMutation<ConjuntoLocation, Error, MapPoint>({
    mutationFn: (point) => setConjuntoLocation(conjuntoId, point),
    onSuccess: (location) => {
      onSaved(location);
      showAlert("Ubicación guardada", "success");
    },
    onError: (error) => showAlert(error.message, "error"),
  });

  const clear = useMutation<ConjuntoLocation, Error>({
    mutationFn: () => clearConjuntoLocation(conjuntoId),
    onSuccess: (location) => {
      onSaved(location);
      showAlert("Pin quitado; la ubicación vuelve a salir de la dirección", "success");
    },
    onError: (error) => showAlert(error.message, "error"),
  });

  const location = query.data;
  if (!location) return null;

  const current =
    location.latitude !== null && location.longitude !== null
      ? { latitude: location.latitude, longitude: location.longitude }
      : null;

  function openEditor() {
    setDraft(current);
    setOpen(true);
  }

  return (
    <div className="bg-white border rounded-xl p-4 flex items-center justify-between gap-4">
      <div>
        <Text font="bold" size="sm">
          Ubicación del conjunto
        </Text>
        <Text size="xs" className={STATUS_COLOR[location.status]}>
          {STATUS_TEXT[location.status]}
        </Text>
      </div>

      <Button colVariant="primary" size="sm" onClick={openEditor}>
        {location.status === "pin" ? "Cambiar" : "Marcar en el mapa"}
      </Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Ubicación del conjunto"
        className="!w-[94%] md:!w-[760px] max-w-[96vw] max-h-[90vh] overflow-y-auto"
      >
        <div className="space-y-4 p-2">
          <Text size="sm" className="text-gray-600">
            {location.address}
            {location.neighborhood ? ` · ${location.neighborhood}` : ""} ·{" "}
            {location.cityName}
          </Text>

          {open && (
            <LocationPicker
              value={draft}
              onChange={setDraft}
              center={location.cityCenter}
              searchQueries={placeSearchQueries({
                address: location.address,
                neighborhood: location.neighborhood,
                city: location.cityName,
              })}
            />
          )}

          <div className="flex flex-wrap justify-end gap-2">
            {location.source === "pin" && (
              <Button
                colVariant="danger"
                size="sm"
                disabled={clear.isPending}
                onClick={() => clear.mutate()}
              >
                Quitar pin
              </Button>
            )}
            <Button
              colVariant="success"
              size="sm"
              disabled={!draft || save.isPending}
              onClick={() => draft && save.mutate(draft)}
            >
              {save.isPending ? "Guardando..." : "Guardar ubicación"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
