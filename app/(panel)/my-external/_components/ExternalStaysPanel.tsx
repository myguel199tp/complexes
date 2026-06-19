"use client";

import { useState } from "react";
import { Button, Buton, Text, Title } from "complexes-next-components";
import { useExternalStays } from "./use-stay-query";
import { useMarkStayAsPaidMutation } from "./use-stay-mutation";
import { useRevokeGuestAccessMutation } from "./use-guest-access-mutation";
import { ExternalStayForm } from "./ExternalStayForm";
import { ExternalStayResponse } from "../services/externalStayService";

const statusLabel: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  CANCELLED: "Cancelada",
};

const statusFilters = ["ALL", "PENDING", "PAID", "CANCELLED"] as const;

export function ExternalStaysPanel({
  externalListingId,
}: {
  externalListingId: string;
}) {
  const { data, isLoading } = useExternalStays(externalListingId);
  const markAsPaidMutation = useMarkStayAsPaidMutation(externalListingId);
  const revokeMutation = useRevokeGuestAccessMutation(externalListingId);

  const [statusFilter, setStatusFilter] =
    useState<(typeof statusFilters)[number]>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [lastCreated, setLastCreated] = useState<ExternalStayResponse | null>(
    null,
  );

  const filtered = (data || []).filter(
    (stay) => statusFilter === "ALL" || stay.status === statusFilter,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Title as="h4" size="sm" font="bold">
          Reservas externas
        </Title>
        <Button
          size="xs"
          colVariant="success"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancelar" : "Registrar estadía"}
        </Button>
      </div>

      {showForm && (
        <ExternalStayForm
          externalListingId={externalListingId}
          onCreated={(stay) => {
            setShowForm(false);
            setLastCreated(stay);
          }}
        />
      )}

      {lastCreated && (
        <div className="bg-green-50 border border-green-300 rounded-md p-2">
          <Text size="sm" className="font-semibold">
            Código de acceso para portería
          </Text>
          {lastCreated.guestAccess?.accessCode ? (
            <Text size="sm">
              {lastCreated.guestAccess.accessCode} (válido del{" "}
              {lastCreated.startDate} al {lastCreated.endDate})
            </Text>
          ) : (
            <Text size="xs" className="text-gray-500">
              El backend no devolvió el código de acceso embebido en la
              respuesta de la estadía — falta confirmar con backend si viene
              en este endpoint o hay que consultarlo aparte.
            </Text>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {statusFilters.map((status) => (
          <Buton
            key={status}
            size="xs"
            borderWidth={statusFilter === status ? "thin" : "none"}
            rounded="lg"
            onClick={() => setStatusFilter(status)}
          >
            {status === "ALL" ? "Todas" : statusLabel[status]}
          </Buton>
        ))}
      </div>

      {isLoading && <Text size="sm">Cargando estadías...</Text>}

      {!isLoading && filtered.length === 0 && (
        <Text size="sm" className="text-gray-500">
          No hay estadías con este filtro.
        </Text>
      )}

      <div className="space-y-2">
        {filtered.map((stay) => (
          <div
            key={stay.id}
            className="border border-gray-200 rounded-md p-2"
          >
            <div className="flex justify-between">
              <Text size="sm" className="font-semibold">
                {stay.guestName}
              </Text>
              <Text size="xs">{statusLabel[stay.status] || stay.status}</Text>
            </div>
            <Text size="xs" className="text-gray-500">
              {stay.guestEmail}
            </Text>
            <Text size="xs" className="text-gray-500">
              {stay.startDate} - {stay.endDate} | {stay.guestsCount}{" "}
              huésped(es)
            </Text>
            {stay.guestAccess?.accessCode && (
              <Text size="xs" className="text-gray-500">
                Código: {stay.guestAccess.accessCode}
              </Text>
            )}

            <div className="flex gap-2 mt-1">
              {stay.status === "PENDING" && (
                <Buton
                  size="xs"
                  borderWidth="none"
                  rounded="lg"
                  onClick={() => markAsPaidMutation.mutate(stay.id)}
                >
                  Marcar como pagada
                </Buton>
              )}
              {stay.guestAccess?.id && (
                <Buton
                  size="xs"
                  borderWidth="none"
                  rounded="lg"
                  onClick={() =>
                    revokeMutation.mutate(stay.guestAccess!.id)
                  }
                >
                  Revocar acceso
                </Buton>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
