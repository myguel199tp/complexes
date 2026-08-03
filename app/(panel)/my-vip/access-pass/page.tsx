"use client";

import React, { useState } from "react";
import { Badge, Button, Text, Title } from "complexes-next-components";
import MessageNotData from "@/app/components/messageNotData";
import { AccessPassResponse } from "@/app/(panel)/my-citofonia/services/response/AccessPassResponse";
import { AccessPassForm } from "./_components/access-pass-form";
import { AccessPassQr } from "./_components/access-pass-qr";
import {
  useMyAccessPasses,
  useRevokeAccessPass,
} from "./_components/access-pass-mutations";

const STATUS_LABEL: Record<AccessPassResponse["status"], string> = {
  ACTIVE: "Vigente",
  USED: "Utilizado",
  REVOKED: "Revocado",
  EXPIRED: "Vencido",
};

const STATUS_COLOR: Record<AccessPassResponse["status"], string> = {
  ACTIVE: "text-green-600",
  USED: "text-gray-500",
  REVOKED: "text-red-600",
  EXPIRED: "text-amber-600",
};

/**
 * Hasta ahora una visita solo se podía registrar cuando la persona ya estaba
 * parada en la reja, y el residente tenía que estar disponible para autorizar en
 * ese momento. Aquí emite el pase por adelantado y el visitante llega con el QR.
 */
export default function AccessPassPage() {
  const { data = [], isLoading, error } = useMyAccessPasses();
  const revoke = useRevokeAccessPass();

  const [openPassId, setOpenPassId] = useState<string | null>(null);

  return (
    <div className="p-4 flex flex-col lg:flex-row gap-6">
      <div className="lg:w-[320px] bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
        <Title size="md" font="bold" as="h3" className="mb-3" colVariant="on">
          Pases de acceso
        </Title>

        <AccessPassForm onCreated={() => setOpenPassId(null)} />
      </div>

      <div className="flex-1">
        <Title size="md" font="bold" as="h3" className="mb-3" colVariant="on">
          Mis pases
        </Title>

        {isLoading && <Text size="sm">Cargando pases…</Text>}

        {error && (
          <Text size="sm" className="text-red-600">
            {(error as Error).message}
          </Text>
        )}

        {!isLoading && data.length === 0 && <MessageNotData />}

        <div className="grid gap-4 md:grid-cols-2">
          {data.map((pass) => (
            <div
              key={pass.id}
              className="border border-gray-200 rounded-xl p-4 bg-white space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Text size="sm" font="bold">
                    {pass.visitorName}
                  </Text>
                  <Text size="xs">Apto {pass.apartment}</Text>
                </div>

                <Badge background="primary" size="sm" rounded="lg">
                  <span className={STATUS_COLOR[pass.status]}>
                    {STATUS_LABEL[pass.status]}
                  </span>
                </Badge>
              </div>

              <Text size="xs">
                Vence: {new Date(pass.validTo).toLocaleString("es-CO")}
              </Text>

              <Text size="xs">
                {/* `maxUses: 0` es el pase recurrente: sin tope dentro de la vigencia. */}
                {pass.maxUses === 0
                  ? `Ingresos: ${pass.usedCount} (sin tope)`
                  : `Ingresos: ${pass.usedCount} de ${pass.maxUses}`}
              </Text>

              {openPassId === pass.id && (
                <div className="py-3">
                  <AccessPassQr passId={pass.id} code={pass.code} />
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {pass.status === "ACTIVE" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() =>
                        setOpenPassId(openPassId === pass.id ? null : pass.id)
                      }
                    >
                      {openPassId === pass.id ? "Ocultar QR" : "Ver QR"}
                    </Button>

                    <Button
                      size="sm"
                      disabled={revoke.isPending}
                      onClick={() =>
                        revoke.mutate({
                          id: pass.id,
                          reason: "Revocado por el residente",
                        })
                      }
                    >
                      Revocar
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
