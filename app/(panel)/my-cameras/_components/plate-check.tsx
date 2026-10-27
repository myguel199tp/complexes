/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Title, Text, Buton } from "complexes-next-components";
import { InputField } from "@/app/components/ui/form";
import { useLookupPlate, useReadPlate } from "./use-cameras";
import {
  PlateCheckResponse,
  PlateMatch,
  PlateVerdict,
} from "../services/response/camera";

interface PlateCheckProps {
  conjuntoId: string;
  /** Sin cámara abierta solo queda la búsqueda a mano. */
  cameraId?: string;
  cameraName?: string;
}

/**
 * El veredicto es lo primero que mira el portero, a un metro de la pantalla y
 * con el carro esperando: por eso va en color y con una sola palabra. Cada
 * color con su par oscuro: estas tarjetas tienen fondo propio y la regla de
 * tema claro de globals.css no les llega.
 */
const VERDICT: Record<PlateVerdict, { label: string; box: string }> = {
  registered: {
    label: "Del conjunto",
    box: "border-green-600 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-900/30 dark:text-green-100",
  },
  expected: {
    label: "La esperan",
    box: "border-amber-500 bg-amber-50 text-amber-900 dark:border-amber-400 dark:bg-amber-900/30 dark:text-amber-100",
  },
  unknown: {
    label: "No registrada",
    box: "border-red-600 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-900/30 dark:text-red-100",
  },
};

function MatchLine({ match, withPlate = false }: { match: PlateMatch; withPlate?: boolean }) {
  const who = [match.unit, match.name].filter(Boolean).join(" — ");
  return (
    <li>
      <Text size="sm">
        {withPlate && <strong>{match.plate} · </strong>}
        {who && <strong>{who}: </strong>}
        {match.detail}
      </Text>
    </li>
  );
}

function PlateResult({
  result,
  doubtful = false,
  onPickSimilar,
}: {
  result: PlateCheckResponse;
  doubtful?: boolean;
  onPickSimilar: (plate: string) => void;
}) {
  const verdict = VERDICT[result.verdict];

  return (
    <div className={`rounded-lg border-l-4 p-3 ${verdict.box}`}>
      <div className="flex flex-wrap items-baseline gap-x-3">
        <span className="font-mono text-2xl font-bold tracking-widest">
          {result.plate}
        </span>
        <span className="text-lg font-bold">{verdict.label}</span>
      </div>

      {doubtful && (
        <Text size="sm" className="mt-1">
          La lectura no fue segura en algún carácter: confírmala con la foto.
        </Text>
      )}
      {!result.colombianFormat && (
        <Text size="sm" className="mt-1">
          No tiene la forma de una placa colombiana. Revisa que esté bien.
        </Text>
      )}

      {result.matches.length > 0 && (
        <ul className="mt-2 space-y-1">
          {result.matches.map((match, index) => (
            <MatchLine key={`${match.kind}-${index}`} match={match} />
          ))}
        </ul>
      )}

      {result.verdict === "unknown" && (
        <Text size="sm" className="mt-2">
          No es de un residente ni de una visita anotada, y no tiene pase
          vigente.
        </Text>
      )}

      {result.similar.length > 0 && (
        <div className="mt-3">
          <Text size="sm" font="bold">
            ¿Será alguna de estas, mal leída?
          </Text>
          <ul className="mt-1 space-y-1">
            {result.similar.map((match, index) => (
              <li
                key={`${match.plate}-${index}`}
                className="flex flex-wrap items-center gap-2"
              >
                <Buton
                  type="button"
                  borderWidth="none"
                  className="rounded border border-current px-2 py-0.5 font-mono text-sm"
                  onClick={() => onPickSimilar(match.plate)}
                >
                  {match.plate}
                </Buton>
                <Text size="sm">
                  {[match.unit, match.name].filter(Boolean).join(" — ")}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * "¿Este carro es del conjunto?" para portería.
 *
 * La lectura con cámara es a pedido —el portero presiona cuando llega un
 * carro— y no automática: cada lectura la hace Lary y se cobra. La búsqueda a
 * mano no tiene costo y queda siempre a la vista, porque es el respaldo cuando
 * la cámara no alcanza a leer (de noche, placa sucia, carro mal parqueado).
 */
export default function PlateCheck({
  conjuntoId,
  cameraId,
  cameraName,
}: PlateCheckProps) {
  const [plate, setPlate] = useState("");
  // Se muestra lo último que se pidió, sea lectura o búsqueda.
  const [shown, setShown] = useState<"read" | "lookup" | null>(null);

  const readMutation = useReadPlate(conjuntoId);
  const lookupMutation = useLookupPlate(conjuntoId);

  const read = () => {
    if (!cameraId) return;
    setShown("read");
    readMutation.mutate(cameraId);
  };

  const lookup = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    setShown("lookup");
    lookupMutation.mutate(clean);
  };

  const reading = shown === "read" ? readMutation : null;
  const searching = shown === "lookup" ? lookupMutation : null;

  return (
    <section className="mb-6 rounded-lg bg-white/5 p-4 text-slate-700 dark:text-slate-200">
      <Title
        as="h4"
        size="sm"
        font="bold"
        className="mb-1 text-slate-900 dark:text-white"
      >
        ¿Es del conjunto?
      </Title>
      <Text size="sm" className="mb-3">
        {cameraId
          ? "Lee la placa con la cámara cuando el carro esté detenido frente a ella, o escríbela."
          : "Escribe la placa, o abre una cámara para leerla desde el video."}
      </Text>

      <div className="flex flex-wrap items-end gap-3">
        {cameraId && (
          <Buton
            type="button"
            borderWidth="none"
            className="rounded bg-cyan-600 px-4 py-2 text-white disabled:opacity-60"
            onClick={read}
            disabled={readMutation.isPending}
          >
            {readMutation.isPending
              ? "Leyendo placa…"
              : `Leer placa${cameraName ? ` con ${cameraName}` : ""}`}
          </Buton>
        )}

        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            lookup(plate);
          }}
        >
          <InputField
            regexType="safeChars"
            helpText="Placa"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            placeholder="ABC123"
            maxLength={10}
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
          />
          <Buton
            type="submit"
            borderWidth="none"
            className="rounded border border-cyan-600 px-3 py-1 text-cyan-700 disabled:opacity-60 dark:text-cyan-400"
            disabled={lookupMutation.isPending || !plate.trim()}
          >
            {lookupMutation.isPending ? "Buscando…" : "Buscar"}
          </Buton>
        </form>
      </div>

      {(reading?.isError || searching?.isError) && (
        <Text size="sm" className="mt-3 text-red-600 dark:text-red-400">
          {((reading ?? searching)?.error as Error).message}
        </Text>
      )}

      {reading?.data && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <figure>
            <img
              src={reading.data.image}
              alt={`Imagen leída de ${reading.data.cameraName}`}
              className="w-full rounded-lg bg-black"
            />
            <figcaption>
              <Text size="sm" className="mt-1">
                {reading.data.cameraName} ·{" "}
                {new Date(reading.data.readAt).toLocaleTimeString("es-CO", {
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </Text>
            </figcaption>
          </figure>

          <div className="space-y-3">
            {reading.data.results.length === 0 && (
              <div className="rounded-lg border-l-4 border-slate-400 bg-slate-50 p-3 text-slate-800 dark:border-slate-500 dark:bg-slate-800/50 dark:text-slate-100">
                <Text size="sm" font="bold">
                  No se leyó ninguna placa.
                </Text>
                {reading.data.reason && (
                  <Text size="sm">{reading.data.reason}</Text>
                )}
                <Text size="sm" className="mt-1">
                  Intenta de nuevo cuando el carro esté detenido, o escribe la
                  placa.
                </Text>
              </div>
            )}

            {reading.data.results.map((result) => (
              <PlateResult
                key={result.plate}
                result={result}
                doubtful={result.doubtful}
                onPickSimilar={(value) => {
                  setPlate(value);
                  lookup(value);
                }}
              />
            ))}

            {reading.data.results.length > 0 && reading.data.reason && (
              <Text size="sm">{reading.data.reason}</Text>
            )}
          </div>
        </div>
      )}

      {searching?.data && (
        <div className="mt-4 max-w-xl">
          <PlateResult
            result={searching.data}
            onPickSimilar={(value) => {
              setPlate(value);
              lookup(value);
            }}
          />
        </div>
      )}
    </section>
  );
}
