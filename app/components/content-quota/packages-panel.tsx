"use client";

import React, { useState } from "react";
import { Button, Text } from "complexes-next-components";
import { IoMdCloseCircle } from "react-icons/io";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { formatCurrency } from "@/app/_helpers/format-currency";
import {
  CONTENT_LABELS,
  ContentModule,
  formatDay,
  PackageOffer,
  PLAN_LABEL,
} from "./content-quota-service";
import {
  useContentQuota,
  usePurchaseContentPackage,
} from "./use-content-quota";
import PackagePurchaseModal from "./package-purchase-modal";

interface Props {
  module: ContentModule;
  onClose: () => void;
}

/**
 * El panel del ⚙ de noticias y de documentos: lo gratis al mes de cada plan,
 * cuánto lleva el conjunto este mes, sus paquetes vigentes y los que puede
 * comprar. Va sobre un contenedor `relative`.
 */
export default function PackagesPanel({ module, onClose }: Props) {
  const label = CONTENT_LABELS[module];
  const showAlert = useAlertStore((state) => state.showAlert);
  const [selectedOffer, setSelectedOffer] = useState<PackageOffer | null>(
    null,
  );

  const { data: quota } = useContentQuota(module);
  const purchase = usePurchaseContentPackage(module);
  const unlimited = quota?.freeLimit === null;

  const handlePurchase = () => {
    if (!selectedOffer) return;

    purchase.mutate(selectedOffer.id, {
      onSuccess: () => {
        showAlert(
          `Listo: tienes ${selectedOffer.maxItems} ${label.many} más.`,
          "success",
        );
        setSelectedOffer(null);
      },
      onError: (error) => showAlert(error.message, "error"),
    });
  };

  return (
    <>
      <div
        className="
        absolute right-0 top-16
        z-50
        flex flex-col gap-3 p-3
        shadow-xl border rounded-lg
        w-full md:w-[260px]
        max-h-[500px] overflow-y-auto
        bg-gray-200
      "
      >
        <div className="w-full flex justify-between">
          <Text size="xs" font="bold">
            {label.Many} gratis al mes
          </Text>
          <IoMdCloseCircle
            className="cursor-pointer"
            color="red"
            onClick={onClose}
          />
        </div>

        <div className="flex flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
          {(quota?.plans ?? []).map(({ plan, freeLimit }) => {
            const current = plan === quota?.plan;

            return (
              <div key={plan} className="flex justify-between gap-2">
                <Text size="xs" font={current ? "bold" : undefined}>
                  {PLAN_LABEL[plan] ?? plan}
                  {current ? " · tu plan" : ""}
                </Text>
                <Text size="xs" font={current ? "bold" : undefined}>
                  {freeLimit === null ? "sin límite" : freeLimit}
                </Text>
              </div>
            );
          })}
          {quota && quota.freeLimit !== null && (
            <Text size="xs" className="mt-1 text-gray-600">
              Este mes llevas {quota.freeUsed} de {quota.freeLimit}. Se renueva
              el {formatDay(quota.resetsAt)}.
            </Text>
          )}
        </div>

        {(quota?.packages.length ?? 0) > 0 && (
          <>
            <Text size="xs" font="bold">
              Tus paquetes
            </Text>
            {quota?.packages.map((pkg) => (
              <div key={pkg.id} className="rounded-lg bg-white p-3 shadow-sm">
                <Text size="xs" font="bold">
                  {pkg.name}
                </Text>
                <Text size="xs">
                  Te quedan {pkg.remaining} de {pkg.maxItems} · vence el{" "}
                  {formatDay(pkg.endsAt)}
                </Text>
              </div>
            ))}
          </>
        )}

        <Text size="xs" font="bold">
          Paquetes adicionales
        </Text>

        {unlimited ? (
          <Text size="xs">
            Tu plan {label.unlimited}: no necesitas paquetes.
          </Text>
        ) : (quota?.offers.length ?? 0) === 0 ? (
          <Text size="xs">No hay paquetes a la venta por ahora.</Text>
        ) : (
          <div className="flex flex-col gap-4">
            {quota?.offers.map((offer) => (
              <div
                key={offer.id}
                className="border rounded-lg p-4 shadow-sm bg-white"
              >
                <Text size="xs" font="bold">
                  {offer.name}
                </Text>

                <Text size="xs">
                  +{offer.maxItems} {label.many}, para usar en{" "}
                  {offer.durationDays} días
                </Text>

                <Text size="xs" font="semi">
                  {formatCurrency(offer.total)} con IVA
                </Text>

                <Button
                  size="md"
                  colVariant="success"
                  className="mt-3 w-full"
                  onClick={() => setSelectedOffer(offer)}
                >
                  Comprar paquete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <PackagePurchaseModal
        module={module}
        offer={selectedOffer}
        simulated={quota?.simulated ?? true}
        isPaying={purchase.isPending}
        onClose={() => setSelectedOffer(null)}
        onConfirm={handlePurchase}
      />
    </>
  );
}
