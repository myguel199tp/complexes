"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Text } from "complexes-next-components";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  CollectionAgreement,
  CollectionAgreementService,
  PROVIDER_LABEL,
} from "../../services/collectionAgreementService";
import CollectionAgreementForm from "./collection-agreement-form";
import CollectionReferencesModal from "./collection-references-modal";

const QUERY_KEY = "query_key_collection_agreements";

/**
 * Convenios de recaudo del conjunto.
 *
 * Es un medio de pago **adicional** a las cuentas bancarias y al enlace de pago
 * digital, no un reemplazo. La diferencia está en que el pago por convenio llega
 * identificado: el residente lo hace citando la referencia de su unidad, así que
 * el banco devuelve de quién es. En la consignación, en cambio, alguien tiene
 * que abrir la foto del comprobante y cruzarla a mano contra el extracto.
 */
export default function CollectionAgreements() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CollectionAgreement | null>(null);
  const [viewingReferences, setViewingReferences] =
    useState<CollectionAgreement | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: agreements = [], isLoading } = useQuery({
    queryKey: [QUERY_KEY, conjuntoId],
    queryFn: () => CollectionAgreementService.list(conjuntoId),
    enabled: !!conjuntoId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY, conjuntoId] });
    // La pantalla del residente lee los convenios desde las instrucciones de
    // pago: sin esto seguiría mostrando los de antes hasta recargar.
    queryClient.invalidateQueries({
      queryKey: ["admin-fee-payment-instructions", conjuntoId],
    });
  };

  const generate = useMutation({
    mutationFn: (id: string) =>
      CollectionAgreementService.generateReferences(id, conjuntoId),
    onSuccess: (result) => {
      setError(null);
      setFeedback(
        `Se emitieron ${result.created} referencias nuevas sobre ${result.units} unidades (${result.total} en total).`,
      );
      invalidate();
    },
    onError: (mutationError: Error) => {
      setFeedback(null);
      setError(mutationError.message);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      CollectionAgreementService.remove(id, conjuntoId),
    onSuccess: () => {
      setError(null);
      setFeedback("Convenio eliminado.");
      invalidate();
    },
    onError: (mutationError: Error) => {
      setFeedback(null);
      setError(mutationError.message);
    },
  });

  const handleDelete = (agreement: CollectionAgreement) => {
    const warning =
      agreement.issuedReferences > 0
        ? `Este convenio tiene ${agreement.issuedReferences} referencias emitidas. Si lo eliminas, esas referencias se borran y los pagos que lleguen con ellas no se van a poder identificar. ¿Eliminar de todos modos?`
        : "¿Eliminar este convenio?";

    if (window.confirm(warning)) remove.mutate(agreement.id);
  };

  if (!conjuntoId) return null;

  return (
    <div className="rounded-xl border bg-white p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <Text font="bold">Convenios de recaudo</Text>

          <Text size="xs" className="text-gray-500">
            Si el conjunto recauda por convenio bancario —MiPagoAmigo, Jelpit,
            Bancolombia, Banco de Bogotá—, configúralo aquí y cada unidad recibe
            su referencia de pago.
          </Text>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm((previous) => !previous);
          }}
          className="shrink-0 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
        >
          {showForm && !editing ? "Cancelar" : "Agregar convenio"}
        </button>
      </div>

      {feedback && (
        <Text size="xs" className="rounded-md bg-green-50 p-2 text-green-700">
          {feedback}
        </Text>
      )}

      {error && (
        <Text size="xs" className="rounded-md bg-red-50 p-2 text-red-700">
          {error}
        </Text>
      )}

      {(showForm || editing) && (
        <CollectionAgreementForm
          conjuntoId={conjuntoId}
          agreement={editing}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditing(null);
            setError(null);
            setFeedback("Convenio guardado.");
            invalidate();
          }}
        />
      )}

      {isLoading && (
        <Text size="xs" className="text-gray-500">
          Cargando convenios…
        </Text>
      )}

      {!isLoading && agreements.length === 0 && !showForm && (
        <Text size="xs" className="text-gray-500">
          Todavía no hay convenios. Los residentes siguen viendo las cuentas
          bancarias y el enlace de pago digital como hasta ahora.
        </Text>
      )}

      <div className="flex flex-col gap-2">
        {agreements.map((agreement) => (
          <div
            key={agreement.id}
            className="rounded-lg border bg-gray-50 p-3 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-2">
              <Text size="sm" font="semi">
                {agreement.displayName ?? PROVIDER_LABEL[agreement.provider]}
              </Text>

              <Badge
                size="sm"
                colVariant={agreement.isActive ? "success" : "default"}
                rounded="lg"
              >
                {agreement.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            <Text size="xs" className="text-gray-500">
              Convenio {agreement.agreementCode} · referencia de{" "}
              {agreement.referenceLength} dígitos ·{" "}
              {agreement.issuedReferences} unidades con referencia
            </Text>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={generate.isPending}
                onClick={() => generate.mutate(agreement.id)}
                className="rounded-md border px-3 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 disabled:opacity-50"
              >
                Emitir referencias
              </button>

              <button
                type="button"
                disabled={agreement.issuedReferences === 0}
                onClick={() => setViewingReferences(agreement)}
                className="rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Ver referencias
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(agreement);
                }}
                className="rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Editar
              </button>

              <button
                type="button"
                disabled={remove.isPending}
                onClick={() => handleDelete(agreement)}
                className="rounded-md border px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {viewingReferences && (
        <CollectionReferencesModal
          conjuntoId={conjuntoId}
          agreement={viewingReferences}
          onClose={() => setViewingReferences(null)}
        />
      )}
    </div>
  );
}
