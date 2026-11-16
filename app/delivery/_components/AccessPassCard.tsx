"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Text } from "complexes-next-components";
import { Button } from "@/app/components/ui/form";
import {
  DeliveryRun,
  DeliveryRunLeg,
  legsOf,
  reissueRunPass,
  runQrUrl,
} from "../services/deliveryOrdersService";

const fmtTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

/**
 * El pase de portería de un conjunto del viaje: el QR, el código escrito y la
 * renovación.
 *
 * Vive en un componente y no dentro de una pantalla porque el repartidor lo
 * necesita en las dos: entra a "Mis entregas" para ver qué le toca y ahí mismo
 * llega a la reja.
 *
 * Es por tramo y no por viaje: desde que un viaje recorre varios conjuntos,
 * cada portería tiene su propio código, y mostrar "el" código del viaje sería
 * enseñarle al celador de un edificio la llave del otro.
 */
export default function AccessPassCard({
  run,
  leg,
  compact = false,
}: {
  run: DeliveryRun;
  /** El conjunto. Sin él, el primero que le queda por visitar. */
  leg?: DeliveryRunLeg | null;
  compact?: boolean;
}) {
  const queryClient = useQueryClient();
  const current =
    leg ??
    legsOf(run).find((l) => l.pendingStops > 0) ??
    legsOf(run)[0] ??
    null;
  const pass = current?.pass ?? null;
  const name = current?.conjuntoName ?? run.conjunto?.name ?? "el conjunto";

  const reissueMut = useMutation({
    mutationFn: () => reissueRunPass(run.id, current?.conjuntoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery_runs"] });
    },
  });

  if (!pass) {
    return (
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3">
        <Text size="xs" className="text-amber-200">
          Tu código para entrar a {name} se venció. Genera uno nuevo antes de
          llegar a la portería.
        </Text>
        <Button
          colVariant="primary"
          size="sm"
          rounded="md"
          className="mt-2"
          disabled={reissueMut.isLoading}
          onClick={() => reissueMut.mutate()}
        >
          {reissueMut.isLoading ? "Generando..." : "Generar código nuevo"}
        </Button>
        {reissueMut.error ? (
          <Text size="xs" colVariant="danger" className="mt-2">
            {(reissueMut.error as Error).message}
          </Text>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-center">
      <Text size="xs" className="text-emerald-200">
        Muestra esto en la portería de {name}
      </Text>

      {/* Fondo blanco fijo: el resto de la pantalla es oscuro y un QR sobre
          fondo oscuro no lo lee ningún lector. */}
      <div className="mx-auto mt-3 w-fit rounded-lg bg-white p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={runQrUrl(run.id, current?.conjuntoId, pass.id)}
          alt={`Código QR de acceso a ${name}`}
          width={compact ? 160 : 220}
          height={compact ? 160 : 220}
          className="block"
        />
      </div>

      {/* El código escrito debajo: si la cámara de la portería falla —pasa—,
          el celador lo teclea y el repartidor no se queda en la reja. */}
      <p className="mt-3 break-all font-mono text-sm font-bold tracking-wider text-emerald-100">
        {pass.code}
      </p>

      <Text size="xs" className="text-emerald-200/70 mt-1">
        Válido hasta las {fmtTime(pass.validTo)}
        {pass.usedAt ? ` · ya lo usaste a las ${fmtTime(pass.usedAt)}` : ""}
      </Text>
    </div>
  );
}
