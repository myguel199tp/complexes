"use client";

import { useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import { countryMap } from "@/app/helpers/longitud-telefono";
import { pricingService } from "@/app/(sets)/registers/services/pricingService";
import type { PricingResponse } from "@/app/(sets)/registers/services/response/pricingResponse";

/**
 * La calculadora de /soluciones/demost, metida dentro de la conversación.
 *
 * "¿Cuánto cuesta?" es la pregunta que más se hace y la única que no se puede
 * responder con un texto fijo: el valor sale del país y de la cantidad de
 * inmuebles. Antes había que mandar al visitante a otra página a averiguarlo;
 * aquí se calcula sin salir del chat, contra el mismo endpoint de pricing.
 */

const PLANS = [
  { key: "basic", label: "Básico" },
  { key: "gold", label: "Oro" },
  { key: "platinum", label: "Platino" },
] as const;

const COUNTRY_OPTIONS = Object.entries(countryMap).map(([name, code]) => ({
  code,
  label: name.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()),
}));

const MIN_APARTMENTS = 10;

function formatPrice(value: number, locale?: string, currency?: string) {
  if (!locale || !currency) return value.toLocaleString();

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}

/** Mensajes de los códigos con que el backend rechaza una cotización. */
const ERROR_TEXT: Record<string, string> = {
  COUNTRY_DISABLED:
    "Todavía no tenemos tarifa publicada para ese país. Escríbele a un asesor y te la cotiza.",
  MIN_APARTMENTS: `El cálculo aplica desde ${MIN_APARTMENTS} inmuebles.`,
};

interface Props {
  /** Se avisa al chat para que el mensaje a WhatsApp lleve lo cotizado. */
  onQuoted?: (resumen: string) => void;
}

export default function PricingCard({ onQuoted }: Props) {
  const [country, setCountry] = useState("");
  const [apartments, setApartments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PricingResponse | null>(null);
  /** El backend no cobra mensual por debajo de 30 inmuebles: se cotiza anual. */
  const [billing, setBilling] = useState<"mensual" | "anual">("mensual");

  const units = Number(apartments) || 0;
  const canQuote = !!country && units >= MIN_APARTMENTS;

  const calculate = async () => {
    if (!canQuote) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let period: "mensual" | "anual" = "mensual";
      let data = await pricingService(country, units, "false", period);

      if (data.error === "MONTHLY_NOT_ALLOWED_UNDER_30") {
        period = "anual";
        data = await pricingService(country, units, "false", period);
      }

      setBilling(period);

      if (!data.plans) {
        setError(
          ERROR_TEXT[data.error ?? ""] ??
            "No pudimos calcularlo con esos datos. Un asesor te lo cotiza."
        );
        return;
      }

      setResult(data);

      const nombrePais =
        COUNTRY_OPTIONS.find((option) => option.code === country)?.label ??
        country;

      onQuoted?.(
        `cuánto cuesta para ${units} inmuebles en ${nombrePais} (cobro ${period})`
      );
    } catch {
      setError(
        "No pudimos consultar el precio en este momento. Un asesor te lo pasa por WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex flex-wrap gap-2">
        <select
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          aria-label="País"
          className="h-9 flex-1 rounded-md border border-gray-300 px-2 text-sm outline-none focus:border-cyan-600"
        >
          <option value="">País</option>
          {COUNTRY_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          inputMode="numeric"
          min={MIN_APARTMENTS}
          value={apartments}
          onChange={(event) => setApartments(event.target.value)}
          placeholder="Inmuebles"
          aria-label="Cantidad de inmuebles"
          className="h-9 w-[110px] rounded-md border border-gray-300 px-2 text-sm outline-none focus:border-cyan-600"
        />
      </div>

      <button
        type="button"
        onClick={calculate}
        disabled={!canQuote || loading}
        className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-cyan-600 text-sm font-semibold text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {loading && <ImSpinner9 className="animate-spin" size={14} />}
        {loading ? "Calculando…" : "Calcular precio"}
      </button>

      {!canQuote && (
        <p className="mt-2 text-xs text-gray-500">
          Elige el país y escribe cuántos inmuebles tiene el conjunto (desde{" "}
          {MIN_APARTMENTS}).
        </p>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {result?.plans && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-gray-500">
            Valor por inmueble, cobro {billing}:
          </p>

          {PLANS.map((plan) => {
            const detail = result.plans?.[plan.key];
            if (!detail) return null;

            const perApartment =
              detail.perApartment ?? Math.ceil(detail.total / units);

            return (
              <div
                key={plan.key}
                className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
              >
                <span className="text-sm font-semibold text-gray-700">
                  {plan.label}
                </span>

                <span className="text-sm text-gray-700">
                  {formatPrice(perApartment, result.locale, result.currency)}
                  <span className="text-xs text-gray-500"> / inmueble</span>
                </span>
              </div>
            );
          })}

          <p className="text-xs text-gray-500">
            Total del conjunto:{" "}
            {formatPrice(
              result.plans.basic.total,
              result.locale,
              result.currency
            )}{" "}
            en el plan Básico. Los valores finales los confirma un asesor.
          </p>
        </div>
      )}
    </div>
  );
}
