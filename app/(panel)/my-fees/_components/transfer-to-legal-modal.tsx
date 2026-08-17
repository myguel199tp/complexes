"use client";

import React, { useState } from "react";
import { Badge, Button, InputField, Modal, Text } from "complexes-next-components";
import {
  LegalCaseStatus,
  OPENABLE_STATUSES,
} from "../services/legalCollectionService";
import type { PortfolioUnit } from "../services/portfolioService";
import { useOpenLegalCaseMutation } from "./use-legal-collection-query";

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);

/** El backend exige al menos 10 caracteres de motivo. */
const MIN_REASON = 10;

interface Props {
  unit: PortfolioUnit | null;
  onClose: () => void;
}

/**
 * Traslado de una unidad a cobro jurídico.
 *
 * Pide el motivo y no solo confirma, porque el traslado tiene consecuencias
 * legales para el residente y el expediente debe decir en qué se fundamentó,
 * no únicamente cuánta plata debía. Antes esta decisión se tomaba mirando la
 * cartera y no quedaba registrada en ninguna parte.
 */
export default function TransferToLegalModal({ unit, onClose }: Props) {
  const [status, setStatus] = useState<LegalCaseStatus>("PREJURIDICO");
  const [reason, setReason] = useState("");
  const [lawyerName, setLawyerName] = useState("");
  const [lawyerEmail, setLawyerEmail] = useState("");
  const [lawyerPhone, setLawyerPhone] = useState("");
  const [externalCaseRef, setExternalCaseRef] = useState("");

  const open = useOpenLegalCaseMutation();

  const reset = () => {
    setStatus("PREJURIDICO");
    setReason("");
    setLawyerName("");
    setLawyerEmail("");
    setLawyerPhone("");
    setExternalCaseRef("");
  };

  const close = () => {
    reset();
    onClose();
  };

  if (!unit) return null;

  const unitLabel =
    [unit.tower, unit.apartment].filter(Boolean).join(" - ") || "la unidad";

  const reasonTooShort = reason.trim().length < MIN_REASON;

  const submit = () => {
    if (reasonTooShort) return;

    open.mutate(
      {
        relationId: unit.relationId,
        status,
        reason: reason.trim(),
        lawyerName: lawyerName.trim() || undefined,
        lawyerEmail: lawyerEmail.trim() || undefined,
        lawyerPhone: lawyerPhone.trim() || undefined,
        externalCaseRef: externalCaseRef.trim() || undefined,
      },
      { onSuccess: close },
    );
  };

  const selectedHint = OPENABLE_STATUSES.find(
    (option) => option.value === status,
  )?.hint;

  return (
    <Modal
      isOpen={!!unit}
      onClose={close}
      title={`Trasladar ${unitLabel} a cobro`}
      className="w-[95%] max-w-2xl"
    >
      <div className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto py-2">
        {/*
          Lo que se congela en el expediente. El saldo sigue moviéndose después
          de escalar, así que esta es la cifra por la que se trasladó y la que
          se le entrega al abogado.
        */}
        <div className="rounded-lg border bg-gray-50 p-3">
          <Text size="sm" font="semi">
            {unit.resident}
          </Text>

          <div className="mt-2 flex flex-wrap gap-4">
            <div>
              <Text size="xs" className="text-gray-500">
                Saldo que se congela
              </Text>
              <Text font="bold" className="text-red-600">
                {money(unit.outstanding)}
              </Text>
            </div>

            <div>
              <Text size="xs" className="text-gray-500">
                Mora más antigua
              </Text>
              <Text font="bold">{unit.daysOverdue} días</Text>
            </div>

            <div>
              <Text size="xs" className="text-gray-500">
                Cuotas en deuda
              </Text>
              <Text font="bold">{unit.feesCount}</Text>
            </div>
          </div>

          {unit.inReview > 0 && (
            <Badge size="sm" colVariant="warning" rounded="lg" className="mt-2">
              Tiene {money(unit.inReview)} por verificar: revísalo antes de
              escalar
            </Badge>
          )}
        </div>

        {/* ETAPA */}
        <div>
          <Text size="sm" font="semi" className="mb-2">
            Etapa inicial
          </Text>

          <div className="flex flex-wrap gap-2">
            {OPENABLE_STATUSES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  status === option.value
                    ? "border-cyan-600 bg-cyan-600 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-cyan-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {selectedHint && (
            <Text size="xs" className="mt-2 text-gray-500">
              {selectedHint}
            </Text>
          )}
        </div>

        {/* MOTIVO */}
        <div>
          <Text size="sm" font="semi" className="mb-1">
            Motivo del traslado
          </Text>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Ej: 8 meses de mora sin respuesta a tres recordatorios de cobro y a la carta del 12 de marzo."
            className="w-full rounded-md border p-3 text-sm"
          />

          <Text
            size="xs"
            className={reasonTooShort ? "text-red-500" : "text-gray-500"}
          >
            {reasonTooShort
              ? `Faltan ${MIN_REASON - reason.trim().length} caracteres. Queda en el expediente como fundamento del traslado.`
              : "Queda en el expediente como fundamento del traslado."}
          </Text>
        </div>

        {/* ABOGADO */}
        <div>
          <Text size="sm" font="semi" className="mb-2">
            Abogado y radicado{" "}
            <span className="font-normal text-gray-500">
              (opcional, se puede completar después)
            </span>
          </Text>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputField
              placeholder="Nombre del abogado"
              helpText="Abogado"
              inputSize="sm"
              value={lawyerName}
              onChange={(e) => setLawyerName(e.target.value)}
            />

            <InputField
              placeholder="correo@despacho.com"
              helpText="Correo"
              inputSize="sm"
              type="email"
              value={lawyerEmail}
              onChange={(e) => setLawyerEmail(e.target.value)}
            />

            <InputField
              placeholder="Teléfono"
              helpText="Teléfono"
              inputSize="sm"
              value={lawyerPhone}
              onChange={(e) => setLawyerPhone(e.target.value)}
            />

            <InputField
              placeholder="Radicado del juzgado"
              helpText="Radicado"
              inputSize="sm"
              value={externalCaseRef}
              onChange={(e) => setExternalCaseRef(e.target.value)}
            />
          </div>
        </div>

        <Text size="xs" className="text-gray-500">
          Al residente le llega un aviso del escalamiento. Enterarse por el
          juzgado y no por la administración es lo que convierte una deuda en un
          conflicto.
        </Text>

        <div className="flex justify-end gap-2 border-t pt-3">
          <Button
            colVariant="default"
            rounded="md"
            onClick={close}
            disabled={open.isPending}
          >
            Cancelar
          </Button>

          <Button
            colVariant="danger"
            rounded="md"
            onClick={submit}
            disabled={reasonTooShort || open.isPending}
          >
            {open.isPending ? "Trasladando..." : "Trasladar a cobro"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
