"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Text } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { FeePaymentsService } from "../../my-fees/services/feePaymentsService";

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  SAVINGS: "Ahorros",
  CHECKING: "Corriente",
};

/**
 * Dónde pagar la cuota.
 *
 * El conjunto configuraba sus cuentas bancarias y su enlace de pago digital,
 * pero ese dato solo se veía en la pantalla del administrador: el residente
 * veía cuánto debía y no a dónde consignarlo, así que terminaba preguntándolo
 * por WhatsApp. La app móvil ya mostraba las cuentas; la web no.
 */
export default function PaymentInstructions() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["admin-fee-payment-instructions", conjuntoId],
    queryFn: () => FeePaymentsService.getInstructions(conjuntoId),
    enabled: !!conjuntoId,
  });

  if (isLoading || !data) return null;

  const hasAccounts = data.bankAccounts.length > 0;
  const hasDigital = data.digitalPaymentEnabled && !!data.digitalPaymentUrl;

  if (!hasAccounts && !hasDigital) return null;

  return (
    <div className="bg-white border rounded-xl p-4 flex flex-col gap-3">
      <Text font="bold">¿Dónde pago?</Text>

      {hasDigital && (
        <a
          href={data.digitalPaymentUrl as string}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-lg bg-cyan-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-cyan-700"
        >
          Pagar en línea
        </a>
      )}

      {hasAccounts && (
        <div className="flex flex-col gap-2">
          {data.bankAccounts.map((account) => (
            <div
              key={account.id}
              className="rounded-lg border bg-gray-50 p-3 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-2">
                <Text size="sm" font="semi">
                  {account.bankName}
                </Text>

                {account.isPrimary && (
                  <Badge size="sm" colVariant="success" rounded="lg">
                    Principal
                  </Badge>
                )}
              </div>

              <Text size="sm" className="font-mono">
                {account.accountNumber}
              </Text>

              <Text size="xs" className="text-gray-500">
                {ACCOUNT_TYPE_LABEL[account.accountType] ??
                  account.accountType}
              </Text>
            </div>
          ))}

          <Text size="xs" className="text-gray-500">
            Después de consignar, sube el comprobante desde la cuota para que la
            administración lo verifique.
          </Text>
        </div>
      )}
    </div>
  );
}
