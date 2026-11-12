"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Text } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  CollectionAgreementInstruction,
  FeePaymentsService,
  PaymentInstructions as Instructions,
} from "../../my-fees/services/feePaymentsService";
import { fileUrl } from "@/app/helpers/fileUrl";

type BankAccountInstruction = Instructions["bankAccounts"][number];

const BRE_B_KEY_LABEL: Record<string, string> = {
  negocio: "Llave de negocio",
  nit: "NIT",
  alfanumerica: "Llave",
  correo: "Correo",
  celular: "Celular",
  cedula: "Cédula",
};

/**
 * Pago por Bre-B: el residente paga a la llave (o escanea el QR) desde la app
 * de cualquier banco y le llega al conjunto en segundos. Igual que con una
 * consignación, después sube el comprobante.
 *
 * El nombre del destinatario va resaltado a propósito: la app del banco lo
 * muestra antes de confirmar, y es la forma de notar que la llave lleva a otra
 * persona.
 */
function BreBCard({
  account,
  reference,
}: {
  account: BankAccountInstruction;
  reference?: string | null;
}) {
  const [copied, setCopied] = React.useState<string | null>(null);
  const breB = account.breB;
  if (!breB) return null;

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Sin portapapeles el dato sigue visible y seleccionable.
    }
  };

  const qr = fileUrl(breB.qrFile);

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Text size="sm" font="semi">
          Pagar por Bre-B
        </Text>
        <Badge size="sm" colVariant="primary" rounded="lg">
          Llega al instante
        </Badge>
      </div>

      <Text size="xs" className="text-gray-600">
        {BRE_B_KEY_LABEL[breB.keyType ?? ""] ?? "Llave"}
      </Text>
      <div className="flex items-center gap-2">
        <Text size="lg" font="semi" className="font-mono break-all">
          {breB.key}
        </Text>
        <button
          type="button"
          onClick={() => copy(breB.key)}
          className="shrink-0 rounded-md border border-violet-300 px-2 py-1 text-xs text-violet-800 hover:bg-violet-100"
        >
          {copied === breB.key ? "Copiada" : "Copiar"}
        </button>
      </div>

      {breB.holderName && (
        <Text size="xs" className="text-gray-700">
          Antes de confirmar, tu banco debe mostrar como destinatario:{" "}
          <strong>{breB.holderName}</strong>. Si aparece otro nombre, no pagues
          y avísale a la administración.
        </Text>
      )}

      {qr && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qr}
          alt="QR de Bre-B del conjunto"
          className="h-40 w-40 self-center rounded-md border bg-white object-contain p-1"
        />
      )}

      {reference && (
        <div className="flex flex-wrap items-center gap-2">
          <Text size="xs" className="text-gray-600">
            En la descripción escribe:
          </Text>
          <span className="font-mono text-sm">{reference}</span>
          <button
            type="button"
            onClick={() => copy(reference)}
            className="rounded-md border border-violet-300 px-2 py-0.5 text-xs text-violet-800 hover:bg-violet-100"
          >
            {copied === reference ? "Copiada" : "Copiar"}
          </button>
        </div>
      )}

      <Text size="xs" className="text-gray-500">
        Después de pagar, sube el comprobante desde la cuota para que la
        administración lo verifique.
      </Text>
    </div>
  );
}

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  SAVINGS: "Ahorros",
  CHECKING: "Corriente",
};

/**
 * Un convenio de recaudo: el residente paga en el banco dictando su
 * referencia.
 *
 * La referencia es lo único que hay que copiar bien, y es un número largo que
 * la gente transcribe a mano en la fila del banco: por eso va en monoespaciado,
 * grande y con botón de copiar, no como un dato más de la tarjeta.
 */
function CollectionAgreementCard({
  agreement,
}: {
  agreement: CollectionAgreementInstruction;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    if (!agreement.reference) return;

    try {
      await navigator.clipboard.writeText(agreement.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles el número sigue visible y seleccionable:
      // no vale la pena interrumpir al residente con un error por esto.
    }
  };

  return (
    <div className="rounded-lg border bg-gray-50 p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <Text size="sm" font="semi">
            {agreement.bankName ?? agreement.displayName}
          </Text>

          {/* La plataforma va aparte del banco porque se repite: Bogotá,
              Occidente, Popular y AV Villas recaudan por AvalPay Center, y el
              residente necesita distinguir cuál es el suyo de un vistazo. */}
          {agreement.platform && (
            <Text size="xs" className="text-gray-500">
              {agreement.platform}
            </Text>
          )}
        </div>

        <Badge size="sm" colVariant="primary" rounded="lg">
          Convenio {agreement.agreementCode}
        </Badge>
      </div>

      {agreement.reference ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-dashed bg-white px-3 py-2">
          <div className="flex flex-col">
            <Text size="xs" className="text-gray-500">
              Tu referencia de pago
            </Text>

            <Text size="md" className="font-mono tracking-wider">
              {agreement.reference}
            </Text>
          </div>

          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded-md border px-3 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50"
          >
            {copied ? "Copiada" : "Copiar"}
          </button>
        </div>
      ) : (
        <Text size="xs" className="text-gray-500">
          Tu unidad todavía no tiene apartamento asignado, así que no podemos
          mostrarte una referencia. Pídele a la administración que la complete.
        </Text>
      )}

      {agreement.paymentChannels.length > 0 && (
        <Text size="xs" className="text-gray-500">
          Puedes pagar en: {agreement.paymentChannels.join(", ")}.
        </Text>
      )}

      {agreement.instructions && (
        <Text size="xs" className="text-gray-500">
          {agreement.instructions}
        </Text>
      )}

      {agreement.paymentUrl && (
        <a
          href={agreement.paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-cyan-700 hover:underline"
        >
          Ir al portal de pago
        </a>
      )}
    </div>
  );
}

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

  const agreements = data.collectionAgreements ?? [];
  const hasAgreements = agreements.length > 0;

  const breBAccounts = data.bankAccounts.filter((account) => !!account.breB);

  if (!hasAccounts && !hasDigital && !hasAgreements) return null;

  return (
    <div className="bg-white border rounded-xl p-4 flex flex-col gap-3">
      <Text font="bold">¿Dónde pago?</Text>

      {/*
        Va primero a propósito: es el único medio en el que el pago llega
        identificado solo. Con los otros el residente tiene que subir el
        comprobante y esperar a que la administración lo verifique.
      */}
      {hasAgreements && (
        <div className="flex flex-col gap-2">
          {agreements.map((agreement) => (
            <CollectionAgreementCard
              key={agreement.id}
              agreement={agreement}
            />
          ))}

          <Text size="xs" className="text-gray-500">
            Al pagar con tu referencia el banco identifica tu unidad. Guarda el
            comprobante por si la administración te lo pide.
          </Text>
        </div>
      )}

      {breBAccounts.map((account) => (
        <BreBCard
          key={`bre-b-${account.id}`}
          account={account}
          reference={data.suggestedReference}
        />
      ))}

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
