"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Text, Title } from "complexes-next-components";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { InputField, SelectField } from "@/app/components/ui/form";
import {
  acceptRequest,
  cancelRequest,
  closeListing,
  declineRequest,
  endContract,
  getMyParkingMarket,
  getOfferableSpots,
  getOpenListings,
  LISTING_STATUS_LABEL,
  MarketListing,
  publishListing,
  REQUEST_STATUS_LABEL,
  requestListing,
} from "./services/parkingMarketService";

const money = (value: number) => `$${(value || 0).toLocaleString("es-CO")}`;

const CARD =
  "rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]";
const MUTED = "text-slate-500 dark:text-slate-400";
const STRONG = "text-slate-800 dark:text-slate-100";

type Tab = "search" | "offer" | "mine";

/**
 * Alquiler de celdas entre residentes.
 *
 * Un propietario ofrece su celda, la administración confirma que es suya y
 * otro residente la pide. Cuando el dueño acepta, nace el contrato: portería ve
 * la placa y cada mes le llega a quien la alquila un link para pagar. El dueño
 * recibe el canon completo; quien la alquila paga además un cargo por servicio.
 *
 * Solo en conjuntos Oro y Platino que lo hayan activado: si no, el backend
 * responde 403 con el motivo y aquí se muestra tal cual.
 */
export default function MyParkingMarketPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const [tab, setTab] = useState<Tab>("search");

  const mineQuery = useQuery({
    queryKey: ["parking-market-mine", conjuntoId],
    queryFn: () => getMyParkingMarket(conjuntoId),
    enabled: !!conjuntoId,
  });

  return (
    <div className="w-full">
      <div className="mb-6">
        <Title size="sm" font="bold" colVariant="on">
          Parqueaderos entre vecinos
        </Title>
        <Text size="sm" className="mt-1 text-gray-400">
          Si tienes una celda que no usas, ofrécela a los demás residentes. Si
          necesitas una, alquila la de un vecino y paga cada mes desde un link.
        </Text>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            ["search", "Buscar celda"],
            ["offer", "Ofrecer mi celda"],
            ["mine", "Mis contratos"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              tab === value
                ? "bg-cyan-600 text-white dark:bg-cyan-500"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "search" ? <SearchTab conjuntoId={conjuntoId} /> : null}
      {tab === "offer" ? (
        <OfferTab conjuntoId={conjuntoId} mine={mineQuery.data} />
      ) : null}
      {tab === "mine" ? (
        <MineTab
          conjuntoId={conjuntoId}
          mine={mineQuery.data}
          loading={mineQuery.isLoading}
          error={mineQuery.error as Error | null}
        />
      ) : null}
    </div>
  );
}

function useRefresh() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["parking-market-mine"] });
    queryClient.invalidateQueries({ queryKey: ["parking-market-open"] });
    queryClient.invalidateQueries({ queryKey: ["parking-market-spots"] });
  };
}

// ─────────────────────────── Buscar ───────────────────────────

function SearchTab({ conjuntoId }: { conjuntoId: string }) {
  const listingsQuery = useQuery({
    queryKey: ["parking-market-open", conjuntoId],
    queryFn: () => getOpenListings(conjuntoId),
    enabled: !!conjuntoId,
  });

  if (listingsQuery.isLoading) {
    return <Text size="sm" className={MUTED}>Cargando celdas…</Text>;
  }

  if (listingsQuery.error) {
    return (
      <Text size="sm" className={MUTED}>
        {(listingsQuery.error as Error).message}
      </Text>
    );
  }

  const listings = listingsQuery.data ?? [];

  if (listings.length === 0) {
    return (
      <Text size="sm" className={MUTED}>
        Por ahora ningún vecino está ofreciendo su celda.
      </Text>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} conjuntoId={conjuntoId} />
      ))}
    </div>
  );
}

function ListingCard({
  listing,
  conjuntoId,
}: {
  listing: MarketListing;
  conjuntoId: string;
}) {
  const showAlert = useAlertStore((s) => s.showAlert);
  const refresh = useRefresh();
  const [asking, setAsking] = useState(false);
  const [plate, setPlate] = useState("");
  const [message, setMessage] = useState("");

  const askMut = useMutation({
    mutationFn: () =>
      requestListing(conjuntoId, listing.id, {
        plate,
        message: message.trim() || undefined,
      }),
    onSuccess: () => {
      showAlert("Listo: el dueño recibió tu solicitud", "success");
      setAsking(false);
      refresh();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  return (
    <div className={CARD}>
      <div className="flex items-start justify-between gap-2">
        <span className={`text-lg font-bold ${STRONG}`}>
          Celda {listing.spotCode}
        </span>
        {listing.zone ? (
          <span className={`text-xs ${MUTED}`}>{listing.zone}</span>
        ) : null}
      </div>

      {listing.description ? (
        <Text size="sm" className={`mt-1 ${MUTED}`}>
          {listing.description}
        </Text>
      ) : null}

      <div className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className={MUTED}>Canon</span>
          <span className={STRONG}>{money(listing.monthlyPrice)}</span>
        </div>
        {listing.feeWithTax > 0 ? (
          <div className="flex justify-between">
            <span className={MUTED}>Cargo por servicio (con IVA)</span>
            <span className={STRONG}>{money(listing.feeWithTax)}</span>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold dark:border-white/10">
          <span className={STRONG}>Pagas al mes</span>
          <span className={STRONG}>{money(listing.monthlyTotal)}</span>
        </div>
      </div>

      {listing.requested ? (
        <Text size="xs" className="mt-3 text-amber-600 dark:text-amber-300">
          Ya la pediste: espera la respuesta del dueño.
        </Text>
      ) : asking ? (
        <div className="mt-3 flex flex-col gap-2">
          <InputField
            regexType="alphanumeric"
            placeholder="Placa del vehículo"
            rounded="md"
            value={plate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPlate(e.target.value)
            }
          />
          <InputField
            regexType="safeChars"
            placeholder="Mensaje para el dueño (opcional)"
            rounded="md"
            value={message}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setMessage(e.target.value)
            }
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              rounded="md"
              colVariant="success"
              disabled={askMut.isPending || plate.trim().length < 3}
              onClick={() => askMut.mutate()}
            >
              Enviar solicitud
            </Button>
            <Button size="sm" rounded="md" onClick={() => setAsking(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          rounded="md"
          colVariant="success"
          className="mt-3"
          onClick={() => setAsking(true)}
        >
          La quiero
        </Button>
      )}
    </div>
  );
}

// ─────────────────────────── Ofrecer ───────────────────────────

function OfferTab({
  conjuntoId,
  mine,
}: {
  conjuntoId: string;
  mine?: Awaited<ReturnType<typeof getMyParkingMarket>>;
}) {
  const showAlert = useAlertStore((s) => s.showAlert);
  const refresh = useRefresh();
  const [spotId, setSpotId] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const spotsQuery = useQuery({
    queryKey: ["parking-market-spots", conjuntoId],
    queryFn: () => getOfferableSpots(conjuntoId),
    enabled: !!conjuntoId,
  });

  const publishMut = useMutation({
    mutationFn: () =>
      publishListing(conjuntoId, {
        spotId,
        monthlyPrice: Number(price || 0),
        description: description.trim() || undefined,
      }),
    onSuccess: () => {
      showAlert(
        "Tu celda quedó publicada. La administración confirma que es tuya y la verán tus vecinos.",
        "success",
      );
      setSpotId("");
      setPrice("");
      setDescription("");
      refresh();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const closeMut = useMutation({
    mutationFn: (id: string) => closeListing(conjuntoId, id),
    onSuccess: () => {
      showAlert("Publicación retirada", "success");
      refresh();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const respondMut = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) =>
      accept ? acceptRequest(conjuntoId, id) : declineRequest(conjuntoId, id),
    onSuccess: (_data, { accept }) => {
      showAlert(
        accept
          ? "Aceptada: el contrato ya está activo y portería ve la placa"
          : "Solicitud rechazada",
        "success",
      );
      refresh();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  if (spotsQuery.error) {
    return (
      <Text size="sm" className={MUTED}>
        {(spotsQuery.error as Error).message}
      </Text>
    );
  }

  const spotOptions = (spotsQuery.data ?? []).map((s) => ({
    value: s.id,
    label: s.zone ? `${s.code} · ${s.zone}` : s.code,
  }));

  const listings = mine?.listings ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className={CARD}>
        <Title size="xs" font="semi" className={STRONG}>
          Ofrecer mi celda
        </Title>
        <Text size="xs" className={`mt-1 ${MUTED}`}>
          Solo el propietario del apartamento puede ofrecer su celda. Recibes el
          canon completo cada mes; quien la alquila paga un cargo por servicio
          aparte.
        </Text>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <SelectField
            id="spotId"
            rounded="md"
            defaultOption={
              spotsQuery.isLoading ? "Cargando celdas…" : "Selecciona tu celda"
            }
            options={spotOptions}
            value={spotId}
            onChange={(e) => setSpotId(e.target.value)}
          />
          <InputField
            regexType="number"
            type="number"
            placeholder="Canon mensual, ej. 150000"
            rounded="md"
            value={price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPrice(e.target.value)
            }
          />
          <InputField
            regexType="safeChars"
            placeholder="Detalles (cubierta, cerca a la torre…)"
            rounded="md"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDescription(e.target.value)
            }
          />
        </div>

        <Button
          className="mt-3"
          rounded="md"
          colVariant="success"
          disabled={publishMut.isPending || !spotId || !Number(price)}
          onClick={() => publishMut.mutate()}
        >
          {publishMut.isPending ? "Publicando…" : "Publicar"}
        </Button>
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {listings.map((listing) => (
            <div key={listing.id} className={CARD}>
              <div className="flex items-start justify-between gap-2">
                <span className={`font-bold ${STRONG}`}>
                  Celda {listing.spotCode} · {money(listing.monthlyPrice)}
                </span>
                <span className={`text-xs ${MUTED}`}>
                  {LISTING_STATUS_LABEL[listing.status]}
                </span>
              </div>

              {listing.rejectionReason ? (
                <Text size="xs" className="mt-1 text-red-500">
                  {listing.rejectionReason}
                </Text>
              ) : null}

              {listing.requests.map((req) => (
                <div
                  key={req.id}
                  className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-white/10"
                >
                  <Text size="sm" className={STRONG}>
                    {req.unit}
                    {req.name ? ` · ${req.name}` : ""} · placa {req.plate}
                  </Text>
                  {req.message ? (
                    <Text size="xs" className={MUTED}>
                      “{req.message}”
                    </Text>
                  ) : null}
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      rounded="md"
                      colVariant="success"
                      disabled={respondMut.isPending}
                      onClick={() => respondMut.mutate({ id: req.id, accept: true })}
                    >
                      Aceptar
                    </Button>
                    <Button
                      size="sm"
                      rounded="md"
                      colVariant="danger"
                      disabled={respondMut.isPending}
                      onClick={() => respondMut.mutate({ id: req.id, accept: false })}
                    >
                      No
                    </Button>
                  </div>
                </div>
              ))}

              {listing.status === "PENDING" || listing.status === "OPEN" ? (
                <Button
                  size="sm"
                  rounded="md"
                  className="mt-3"
                  disabled={closeMut.isPending}
                  onClick={() => closeMut.mutate(listing.id)}
                >
                  Retirar
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ─────────────────────────── Mis contratos ───────────────────────────

function MineTab({
  conjuntoId,
  mine,
  loading,
  error,
}: {
  conjuntoId: string;
  mine?: Awaited<ReturnType<typeof getMyParkingMarket>>;
  loading: boolean;
  error: Error | null;
}) {
  const showAlert = useAlertStore((s) => s.showAlert);
  const refresh = useRefresh();

  const endMut = useMutation({
    mutationFn: (id: string) => endContract(conjuntoId, id),
    onSuccess: () => {
      showAlert("Contrato terminado: desde hoy no se cobra más", "success");
      refresh();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelRequest(conjuntoId, id),
    onSuccess: () => {
      showAlert("Solicitud cancelada", "success");
      refresh();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  if (loading) return <Text size="sm" className={MUTED}>Cargando…</Text>;
  if (error) return <Text size="sm" className={MUTED}>{error.message}</Text>;

  const contracts = mine?.contracts ?? [];
  const requests = (mine?.requests ?? []).filter((r) => r.status === "PENDING");

  if (contracts.length === 0 && requests.length === 0) {
    return (
      <Text size="sm" className={MUTED}>
        Todavía no tienes contratos ni solicitudes.
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {requests.map((req) => (
        <div key={req.id} className={CARD}>
          <Text size="sm" className={STRONG}>
            Pediste la celda {req.spotCode} ·{" "}
            {money(req.monthlyPrice ?? 0)} / mes
          </Text>
          <Text size="xs" className={MUTED}>
            {REQUEST_STATUS_LABEL[req.status]}
          </Text>
          <Button
            size="sm"
            rounded="md"
            className="mt-2"
            disabled={cancelMut.isPending}
            onClick={() => cancelMut.mutate(req.id)}
          >
            Cancelar solicitud
          </Button>
        </div>
      ))}

      {contracts.map((contract) => {
        const pending = contract.charges.filter((c) => c.status === "PENDING");

        return (
          <div key={contract.id} className={CARD}>
            <div className="flex items-start justify-between gap-2">
              <span className={`font-bold ${STRONG}`}>
                Celda {contract.spotCode} · {money(contract.monthlyFee)} / mes
              </span>
              <span className={`text-xs ${MUTED}`}>
                {contract.status === "ACTIVE" ? "Vigente" : "Terminado"}
              </span>
            </div>
            <Text size="xs" className={MUTED}>
              {contract.role === "OWNER"
                ? `Alquilas tu celda a ${contract.counterpart}`
                : `Alquilas la celda de ${contract.counterpart}`}
              {contract.plate ? ` · placa ${contract.plate}` : ""}
            </Text>

            {contract.role === "TENANT" && pending.length > 0 ? (
              <div className="mt-3 flex flex-col gap-2">
                {pending.map((charge) => (
                  <div
                    key={charge.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-500/10"
                  >
                    <Text size="sm" className="text-amber-800 dark:text-amber-200">
                      {charge.period}: {money(charge.total)} · vence{" "}
                      {charge.dueDate}
                    </Text>
                    {charge.payUrl ? (
                      <a
                        href={charge.payUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Pagar
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {contract.role === "OWNER" ? (
              <Text size="xs" className={`mt-2 ${MUTED}`}>
                {contract.charges.filter((c) => c.status === "PAID").length}{" "}
                mes(es) pagados
                {pending.length > 0 ? ` · ${pending.length} pendiente(s)` : ""}
              </Text>
            ) : null}

            {contract.status === "ACTIVE" ? (
              <Button
                size="sm"
                rounded="md"
                colVariant="warning"
                className="mt-3"
                disabled={endMut.isPending}
                onClick={() => endMut.mutate(contract.id)}
              >
                Terminar contrato
              </Button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
