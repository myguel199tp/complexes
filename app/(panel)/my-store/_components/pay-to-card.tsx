"use client";

import { useState } from "react";
import { ACCOUNT_TYPE_LABELS, PayTo } from "../services/comercioStoreService";

/**
 * A qué cuenta transferir.
 *
 * El pedido ofrecía "transferencia" y en ningún lado decía a dónde: el
 * residente tenía que llamar al comercio a preguntar el número, que es justo
 * la vuelta que pagar dentro de la plataforma debía ahorrar. El número se
 * copia de un toque porque se va a pegar en la app del banco.
 *
 * Va siempre en tonos claros: vive dentro de la tarjeta del pedido y del
 * modal de la librería, que son blancos también en modo oscuro.
 */
export default function PayToCard({
  payTo,
  amount,
}: {
  payTo: PayTo;
  amount: number;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(payTo.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles el número sigue a la vista para copiarlo a
      // mano; no hay nada más que hacer.
    }
  }

  return (
    <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm">
      <p className="text-xs font-semibold text-cyan-800">
        Transfiere ${Number(amount).toLocaleString("es-CO")} a:
      </p>

      <p className="mt-1 text-gray-800">
        {payTo.bankName} · {ACCOUNT_TYPE_LABELS[payTo.accountType]}
      </p>

      <div className="mt-1 flex items-center gap-2">
        <span className="font-mono text-base font-bold text-gray-900">
          {payTo.accountNumber}
        </span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-cyan-300 px-2 py-0.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-100"
        >
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
      </div>

      {payTo.holder || payTo.taxId ? (
        <p className="mt-1 text-xs text-gray-600">
          {payTo.holder}
          {payTo.taxId ? ` · NIT/CC ${payTo.taxId}` : ""}
        </p>
      ) : null}
    </div>
  );
}
