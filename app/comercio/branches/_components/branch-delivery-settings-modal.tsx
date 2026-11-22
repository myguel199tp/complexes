"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Text } from "complexes-next-components";
import ComercioModal from "../../_components/comercio-modal";
import { Button } from "@/app/components/ui/form";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { ComercioBranch, updateBranch } from "../services/comercioBranchService";
import { setBranchHiring } from "../../deliveries/services/comercioDeliveryService";

const inputCls =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800";

/**
 * Domicilios de una sucursal: si ofrece entrega directa y con qué recargo, y
 * si está buscando repartidores en la bolsa.
 *
 * Van juntos porque los dos responden a la misma pregunta del dueño —"¿cómo
 * reparte esta sede?"— y separados de la ficha de la sucursal, que es sobre
 * dónde queda.
 */
export default function BranchDeliverySettingsModal({
  branch,
  onClose,
}: {
  branch: ComercioBranch | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [deliveryFee, setDeliveryFee] = useState("");
  const [priority, setPriority] = useState(false);
  const [fee, setFee] = useState("");
  const [hiring, setHiring] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!branch) return;
    setDeliveryFee(
      branch.deliveryFee !== undefined && Number(branch.deliveryFee) > 0
        ? String(Number(branch.deliveryFee))
        : "",
    );
    setPriority(!!branch.priorityDeliveryEnabled);
    setFee(
      branch.priorityDeliveryFee !== undefined && Number(branch.priorityDeliveryFee) > 0
        ? String(Number(branch.priorityDeliveryFee))
        : "",
    );
    setHiring(!!branch.hiringDeliveries);
    setNote(branch.hiringNote ?? "");
  }, [branch]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!branch) return;
      await updateBranch(branch.id, {
        deliveryFee: Number(deliveryFee || 0),
        priorityDeliveryEnabled: priority,
        priorityDeliveryFee: priority ? Number(fee || 0) : 0,
      });
      await setBranchHiring(branch.id, { hiring, note });
    },
    onSuccess: () => {
      showAlert("Domicilios de la sucursal guardados", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-branches"] });
      onClose();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  return (
    <ComercioModal
      isOpen={!!branch}
      onClose={onClose}
      title={`Domicilios · ${branch?.name ?? ""}`}
      className="!w-[94%] md:!w-[640px] max-w-[96vw] max-h-[88vh] overflow-y-auto"
    >
      <div className="space-y-6 p-2">
        <section>
          <label className="block text-sm font-semibold text-gray-800">
            Domicilio (COP)
            <input
              type="number"
              min={0}
              step={500}
              value={deliveryFee}
              placeholder="0 = gratis"
              onChange={(e) => setDeliveryFee(e.target.value)}
              className={inputCls}
            />
          </label>
          <Text size="xs" className="mt-1 text-gray-500">
            Se suma a cada pedido que lleve productos y lo cobras tú, con el
            resto del pedido. Un pedido de solo servicios no paga domicilio.
            Déjalo vacío si el domicilio es gratis. Lo que le pagas al
            repartidor es aparte: lo acuerdas con él en su ficha.
          </Text>
        </section>

        <section>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <input
              type="checkbox"
              checked={priority}
              onChange={(e) => setPriority(e.target.checked)}
            />
            Ofrecer entrega directa
          </label>
          <Text size="xs" className="mt-1 text-gray-500">
            El cliente puede pedir que su pedido salga solo, sin otras paradas.
            El recargo se suma a su pedido y lo cobras tú, como el resto.
            Déjalo en 0 si lo ofreces sin costo.
          </Text>
          {priority ? (
            <label className="mt-2 block text-xs text-gray-600">
              Recargo por entrega directa (COP)
              <input
                type="number"
                min={0}
                step={500}
                value={fee}
                placeholder="0"
                onChange={(e) => setFee(e.target.value)}
                className={inputCls}
              />
            </label>
          ) : null}
        </section>

        <section>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <input
              type="checkbox"
              checked={hiring}
              onChange={(e) => setHiring(e.target.checked)}
            />
            Estoy buscando repartidores
          </label>
          <Text size="xs" className="mt-1 text-gray-500">
            La sucursal aparece en la bolsa para los repartidores de tu zona
            (hasta 40 km), y pueden postularse. Tú decides a quién aceptar.
          </Text>
          {hiring ? (
            <label className="mt-2 block text-xs text-gray-600">
              Qué ofreces o qué necesitas (opcional)
              <textarea
                rows={3}
                maxLength={300}
                value={note}
                placeholder="Ej.: turno de 6 a 11 pm, moto propia, pagamos $5.000 por entrega"
                onChange={(e) => setNote(e.target.value)}
                className={inputCls}
              />
            </label>
          ) : null}
        </section>

        <Button
          colVariant="success"
          size="full"
          rounded="md"
          disabled={saveMut.isLoading}
          onClick={() => saveMut.mutate()}
        >
          {saveMut.isLoading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </ComercioModal>
  );
}
