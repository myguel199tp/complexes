"use client";

import { Button, Text } from "complexes-next-components";
import React from "react";
import {
  CONTENT_LABELS,
  ContentQuota,
  formatDay,
  PLAN_LABEL,
} from "./content-quota-service";

interface Props {
  quota: ContentQuota;
  onBuyPackages?: () => void;
}

/**
 * Cuántas noticias o documentos le quedan al conjunto este mes, antes de subir.
 *
 * Va dentro de la tarjeta de los formularios, que es blanca en los dos temas:
 * por eso los colores son claros y no llevan `dark:`.
 */
export default function QuotaNote({ quota, onBuyPackages }: Props) {
  const plan = PLAN_LABEL[quota.plan] ?? quota.plan;
  const label = CONTENT_LABELS[quota.module];
  const count = (n: number) => `${n} ${n === 1 ? label.one : label.many}`;
  const left = (n: number) => (n === 1 ? "te queda 1" : `te quedan ${n}`);

  if (quota.freeLimit === null) {
    return (
      <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <Text size="sm" className="text-emerald-800">
          Tu plan {plan} {label.unlimited}.
        </Text>
      </div>
    );
  }

  const resets = formatDay(quota.resetsAt);
  const exhausted = quota.remaining === 0;

  let text: string;

  if (quota.freeRemaining && quota.freeRemaining > 0) {
    const extra =
      quota.packageRemaining > 0
        ? `, más ${count(quota.packageRemaining)} de tus paquetes`
        : "";
    text =
      `Tu plan ${plan} incluye ${count(quota.freeLimit)} gratis al mes. ` +
      `Llevas ${quota.freeUsed} y ${left(quota.freeRemaining)}${extra}. ` +
      `El cupo se renueva el ${resets}.`;
  } else if (!exhausted) {
    text =
      `Ya usaste ${label.the} ${count(quota.freeLimit)} gratis de este mes de tu plan ${plan}. ` +
      `${left(quota.packageRemaining).replace(/^t/, "T")} de tus paquetes.`;
  } else {
    text =
      `Ya usaste ${label.the} ${count(quota.freeLimit)} gratis de este mes de tu plan ${plan}. ` +
      `Compra un paquete para ${label.more}, o espera al ${resets}, cuando se renueva el cupo.`;
  }

  return (
    <div
      className={
        exhausted
          ? "w-full rounded-lg border border-amber-200 bg-amber-50 p-3 flex flex-col md:!flex-row md:items-center gap-2"
          : "w-full rounded-lg border border-sky-200 bg-sky-50 p-3"
      }
    >
      <Text
        size="sm"
        className={exhausted ? "text-amber-800 flex-1" : "text-sky-800"}
      >
        {text}
      </Text>

      {exhausted && onBuyPackages && (
        <Button
          type="button"
          colVariant="success"
          size="sm"
          rounded="md"
          onClick={onBuyPackages}
          className="shrink-0"
        >
          Ver paquetes
        </Button>
      )}
    </div>
  );
}
