"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Text } from "complexes-next-components";
import { InputField } from "@/app/components/ui/form";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  ExpectedParcel,
  expectedDayLabel,
  getExpectedParcels,
  getParcelResidents,
  ParcelRefusalKind,
  ParcelResident,
  parcelUnit,
  heldOf,
  money,
  REFUSAL_KIND_LABEL,
  refuseParcel,
  registerParcel,
  sameUnit,
} from "../../services/parcelService";
import ParcelPhotoField from "./parcel-photo-field";
import ResidentPicker from "./resident-picker";

interface Props {
  isOpen: boolean;
  conjuntoId: string;
  /** Si se abrió desde "Llegó" en un paquete que el residente avisó. */
  expected?: ExpectedParcel | null;
  onClose: () => void;
}

const REFUSAL_KINDS = Object.keys(REFUSAL_KIND_LABEL) as ParcelRefusalKind[];

const describeExpected = (item: ExpectedParcel) =>
  `${[item.carrier, item.description].filter(Boolean).join(" · ") || "Paquete"} (${expectedDayLabel(item.expectedDate).label.toLowerCase()}${item.cashOnDelivery ? ", contraentrega" : ""})`;

const choice = (active: boolean) =>
  `flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
    active
      ? "border-cyan-700 bg-cyan-700 text-white"
      : "border-gray-300 text-gray-700 hover:bg-gray-100"
  }`;

const EMPTY = {
  apartment: "",
  tower: "",
  recipientName: "",
  carrier: "",
  trackingNumber: "",
  description: "",
  quantity: "1",
};

/** El límite del backend: más atrás ya parece un error de digitación. */
const MAX_BACKDATE_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

/** `datetime-local` trabaja con la hora local, sin zona. */
const toLocalInput = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);

const CARRIERS = [
  "Servientrega",
  "Coordinadora",
  "Interrapidísimo",
  "Envía",
  "Deprisa",
  "TCC",
  "Mercado Libre",
  "Amazon",
  "DHL",
  "FedEx",
];

/**
 * Solo la unidad es obligatoria. Con el mensajero esperando en la reja, cada
 * campo exigido es una razón más para no registrar el paquete.
 */
export default function RegisterParcelModal({
  isOpen,
  conjuntoId,
  expected = null,
  onClose,
}: Props) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [form, setForm] = useState(EMPTY);
  const [residentId, setResidentId] = useState<string | null>(null);
  // Un apartamento sin residentes en la app no sale en la lista, pero el
  // paquete ya está en portería y hay que dejar constancia.
  const [manualUnit, setManualUnit] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Vacío es "acaba de llegar": la mayoría de las veces no hay nada que elegir.
  const [arrivedEarlier, setArrivedEarlier] = useState(false);
  const [receivedAt, setReceivedAt] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [damaged, setDamaged] = useState(false);
  // "No se pudo recibir": contraentrega sin pago, o solo al destinatario.
  const [received, setReceived] = useState(true);
  const [refusalKind, setRefusalKind] =
    useState<ParcelRefusalKind>("CASH_ON_DELIVERY");
  const [refusalReason, setRefusalReason] = useState("");
  const [expectedId, setExpectedId] = useState<string | null>(null);
  // Si la unidad dejó plata para este paquete: cuánto se le pagó al mensajero.
  const [cashPaid, setCashPaid] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setForm(EMPTY);
    setResidentId(null);
    setManualUnit(false);
    setPhoto(null);
    setError(null);
    setArrivedEarlier(false);
    setReceivedAt("");
    setUrgent(false);
    setDamaged(false);
    setReceived(true);
    setRefusalKind("CASH_ON_DELIVERY");
    setRefusalReason("");
    setExpectedId(expected?.id ?? null);
    setCashPaid("");

    if (expected) {
      setForm({
        ...EMPTY,
        apartment: expected.apartment,
        tower: expected.tower ?? "",
        recipientName: expected.createdBy?.name ?? "",
        carrier: expected.carrier ?? "",
        description: expected.description ?? "",
      });
    }
  }, [isOpen, expected]);

  const { data: waitingList = [] } = useQuery({
    queryKey: ["parcel-expected", conjuntoId],
    queryFn: () => getExpectedParcels(conjuntoId),
    enabled: isOpen && !!conjuntoId,
  });

  const {
    data: residents = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["parcel-residents", conjuntoId],
    queryFn: () => getParcelResidents(conjuntoId),
    enabled: isOpen && !!conjuntoId,
  });

  const set = (field: keyof typeof EMPTY, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const selectResident = (resident: ParcelResident) => {
    setResidentId(resident.id);
    setExpectedId(null);
    setManualUnit(false);
    setForm((current) => ({
      ...current,
      apartment: resident.apartment,
      tower: resident.tower ?? "",
      recipientName: resident.name ?? "",
    }));
  };

  const writeUnit = () => {
    setResidentId(null);
    setExpectedId(null);
    setManualUnit(true);
  };

  const backToList = () => {
    setManualUnit(false);
    setExpectedId(null);
    setForm((current) => ({ ...current, apartment: "", tower: "" }));
  };

  const linked =
    waitingList.find((item) => item.id === expectedId) ??
    (expected && expected.id === expectedId ? expected : null);

  // La plata que la unidad dejó y que todavía no se ha usado para pagar.
  const pendingCash =
    linked?.cash && linked.cash.status === "HELD" && linked.cash.paidAmount == null
      ? linked.cash
      : null;
  const cashLeft = pendingCash ? heldOf(pendingCash) : 0;
  const paidValue = Number(cashPaid);
  const validPaid =
    cashPaid.trim() !== "" &&
    Number.isInteger(paidValue) &&
    paidValue >= 0 &&
    paidValue <= cashLeft;

  // Lo que la unidad avisó que espera: es lo que convierte el aviso en paquete.
  const unitExpected =
    !expectedId && form.apartment
      ? waitingList.filter((item) => sameUnit(item, form))
      : [];

  const link = (item: ExpectedParcel) => {
    setExpectedId(item.id);
    setForm((current) => ({
      ...current,
      carrier: current.carrier || item.carrier || "",
      description: current.description || item.description || "",
    }));
  };

  const refusal = useMutation({
    mutationFn: () =>
      refuseParcel(conjuntoId, {
        apartment: form.apartment.trim(),
        tower: form.tower.trim() || undefined,
        recipientName: form.recipientName.trim() || undefined,
        carrier: form.carrier.trim() || undefined,
        description: form.description.trim() || undefined,
        kind: refusalKind,
        reason: refusalReason.trim() || undefined,
      }),
    onSuccess: ({ notified }) => {
      showAlert(
        notified
          ? "Quedó la constancia y se le avisó a la unidad."
          : "Quedó la constancia, pero nadie recibió el aviso: esa unidad no tiene residentes con la app.",
        notified ? "success" : "info",
      );
      queryClient.invalidateQueries({ queryKey: ["parcels"] });
      onClose();
    },
    onError: (e: Error) => setError(e.message),
  });

  const mutation = useMutation({
    mutationFn: () => {
      const data = new FormData();

      Object.entries(form).forEach(([field, value]) => {
        if (value.trim()) data.append(field, value.trim());
      });

      if (arrivedEarlier && receivedAt) {
        data.append("receivedAt", new Date(receivedAt).toISOString());
      }

      if (expectedId) data.append("expectedId", expectedId);
      if (pendingCash) data.append("cashPaid", String(paidValue));
      if (urgent) data.append("urgent", "true");
      if (damaged) data.append("damaged", "true");
      if (photo) data.append("file", photo);

      return registerParcel(conjuntoId, data);
    },
    onSuccess: ({ notified }) => {
      showAlert(
        notified
          ? `Paquete registrado. Se le avisó a ${notified} residente${notified === 1 ? "" : "s"}.`
          : "Paquete registrado, pero nadie recibió el aviso: esa unidad no tiene residentes con la app.",
        notified ? "success" : "info",
      );
      queryClient.invalidateQueries({ queryKey: ["parcels"] });
      queryClient.invalidateQueries({ queryKey: ["parcel-expected"] });
      onClose();
    },
    onError: (e: Error) => setError(e.message),
  });

  // Sin foto, "llegó dañado" es solo la palabra de quien lo recibió.
  const missingDamagePhoto = damaged && !photo;
  const missingArrival = arrivedEarlier && !receivedAt;

  const ready = received
    ? Boolean(form.apartment.trim()) &&
      !missingDamagePhoto &&
      !missingArrival &&
      (!pendingCash || validPaid)
    : Boolean(form.apartment.trim()) &&
      (refusalKind !== "OTHER" || refusalReason.trim().length >= 5);

  const busy = mutation.isPending || refusal.isPending;

  const now = new Date();

  return (
    <Modal
      isOpen={isOpen}
      title="Registrar paquete"
      className="w-11/12 max-w-6xl"
      onClose={onClose}
    >
      <form
        className="flex max-h-[78vh] flex-col gap-4 overflow-y-auto"
        onSubmit={(event) => {
          event.preventDefault();
          if (!ready) return;
          if (received) mutation.mutate();
          else refusal.mutate();
        }}
      >
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            className={choice(received)}
            onClick={() => setReceived(true)}
          >
            Se recibió
          </button>
          <button
            type="button"
            className={choice(!received)}
            onClick={() => setReceived(false)}
          >
            No se pudo recibir
          </button>
        </div>

        <section className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1.3fr)]">
          <div className="flex min-w-0 flex-col gap-2">
            <ResidentPicker
              residents={residents}
              isLoading={isLoading}
              isError={isError}
              selectedId={residentId}
              onSelect={selectResident}
            />

            {!manualUnit && (
              <button
                type="button"
                className="self-start text-xs font-semibold text-cyan-700 underline"
                onClick={writeUnit}
              >
                ¿La unidad no aparece? Escríbela
              </button>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <Text
              size="xs"
              font="bold"
              className="mb-1 uppercase tracking-wide text-gray-400"
            >
              Datos del paquete
            </Text>

            {manualUnit ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <InputField
                    helpText="Apartamento *"
                    sizeHelp="xs"
                    inputSize="sm"
                    value={form.apartment}
                    maxLength={30}
                    required
                    autoFocus
                    onChange={(event) => set("apartment", event.target.value)}
                  />
                  <InputField
                    helpText="Torre"
                    sizeHelp="xs"
                    inputSize="sm"
                    value={form.tower}
                    maxLength={30}
                    onChange={(event) => set("tower", event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="self-start text-xs font-semibold text-cyan-700 underline"
                  onClick={backToList}
                >
                  Elegir de la lista
                </button>
              </>
            ) : (
              <div
                className={`rounded-lg border px-3 py-2 text-sm ${
                  form.apartment
                    ? "border-cyan-300 bg-cyan-50 font-semibold text-cyan-800"
                    : "border-amber-300 bg-amber-50 text-amber-800"
                }`}
              >
                {form.apartment
                  ? parcelUnit(form)
                  : "Selecciona el residente en la lista."}
              </div>
            )}

            {received && linked && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                <span>Es el que avisó la unidad: {describeExpected(linked)}</span>
                <button
                  type="button"
                  className="shrink-0 font-semibold underline"
                  onClick={() => setExpectedId(null)}
                >
                  No es este
                </button>
              </div>
            )}

            {received && pendingCash && (
              <div className="flex flex-col gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                <span className="font-semibold">
                  La unidad dejó {money(cashLeft)} en portería para pagarlo.
                </span>
                <label>
                  <span className="mb-1 block">
                    ¿Cuánto se le pagó a la transportadora? *
                  </span>
                  <input
                    className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-sm text-gray-900"
                    type="number"
                    min={0}
                    max={cashLeft}
                    step={1}
                    inputMode="numeric"
                    value={cashPaid}
                    onChange={(event) => setCashPaid(event.target.value)}
                  />
                </label>
                {validPaid && paidValue < cashLeft && (
                  <span>Quedan {money(cashLeft - paidValue)} de vueltas para la unidad.</span>
                )}
                {cashPaid.trim() !== "" && !validPaid && (
                  <span className="text-red-600">
                    Debe ser un valor entre $0 y {money(cashLeft)}.
                  </span>
                )}
              </div>
            )}

            {received && linked?.cashOnDelivery && !pendingCash && (
              <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Es contraentrega. Si no hay quién pague, marca «No se pudo
                recibir».
              </p>
            )}

            {received && unitExpected.length > 0 && (
              <div className="rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-xs text-cyan-800">
                <p className="font-semibold">Esta unidad avisó que espera:</p>
                {unitExpected.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="mt-1 block text-left underline"
                    onClick={() => link(item)}
                  >
                    {describeExpected(item)}: ¿es este?
                  </button>
                ))}
              </div>
            )}

            <InputField
              helpText="A nombre de"
              sizeHelp="xs"
              inputSize="sm"
              value={form.recipientName}
              maxLength={120}
              onChange={(event) => set("recipientName", event.target.value)}
            />

            <InputField
              helpText="Transportadora o tienda"
              sizeHelp="xs"
              inputSize="sm"
              list="parcel-carriers"
              value={form.carrier}
              maxLength={80}
              onChange={(event) => set("carrier", event.target.value)}
            />
            <datalist id="parcel-carriers">
              {CARRIERS.map((carrier) => (
                <option key={carrier} value={carrier} />
              ))}
            </datalist>

            {received && (
              <InputField
                helpText="Número de guía"
                sizeHelp="xs"
                inputSize="sm"
                value={form.trackingNumber}
                maxLength={80}
                onChange={(event) => set("trackingNumber", event.target.value)}
              />
            )}

            <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-2">
              <InputField
                helpText="Descripción"
                sizeHelp="xs"
                inputSize="sm"
                value={form.description}
                maxLength={200}
                placeholder="Sobre, caja mediana…"
                onChange={(event) => set("description", event.target.value)}
              />
              <InputField
                helpText="Cantidad"
                sizeHelp="xs"
                inputSize="sm"
                type="number"
                min={1}
                max={50}
                value={form.quantity}
                onChange={(event) => set("quantity", event.target.value)}
              />
            </div>

            {!received && (
              <>
                <label>
                  <span className="mb-1 block text-xs font-medium text-gray-600">
                    ¿Por qué no se recibió?
                  </span>
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                    value={refusalKind}
                    onChange={(event) =>
                      setRefusalKind(event.target.value as ParcelRefusalKind)
                    }
                  >
                    {REFUSAL_KINDS.map((option) => (
                      <option key={option} value={option}>
                        {REFUSAL_KIND_LABEL[option]}
                      </option>
                    ))}
                  </select>
                </label>
                <InputField
                  helpText={
                    refusalKind === "OTHER"
                      ? "¿Qué pasó? *"
                      : "¿Qué pasó? (opcional)"
                  }
                  sizeHelp="xs"
                  inputSize="sm"
                  value={refusalReason}
                  maxLength={300}
                  onChange={(event) => setRefusalReason(event.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Queda constancia de que vino y a la unidad le llega el aviso
                  para que lo arregle con la transportadora.
                </p>
              </>
            )}

            {received && (
            <>
            <label className="mt-1 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={arrivedEarlier}
                onChange={(event) => setArrivedEarlier(event.target.checked)}
              />
              Llegó hace rato
            </label>

            {arrivedEarlier && (
              <InputField
                helpText="¿Cuándo llegó?"
                sizeHelp="xs"
                inputSize="sm"
                type="datetime-local"
                value={receivedAt}
                min={toLocalInput(
                  new Date(now.getTime() - MAX_BACKDATE_DAYS * DAY_MS),
                )}
                max={toLocalInput(now)}
                onChange={(event) => setReceivedAt(event.target.value)}
              />
            )}

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={urgent}
                onChange={(event) => setUrgent(event.target.checked)}
              />
              Urgente: comida o medicina
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={damaged}
                onChange={(event) => setDamaged(event.target.checked)}
              />
              Llegó dañado
            </label>

            {missingDamagePhoto && (
              <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Toma una foto del daño: es lo que te protege si hay un reclamo.
              </p>
            )}
            </>
            )}
          </div>

          {received && (
            <ParcelPhotoField
              photo={photo}
              onChange={setPhoto}
              onError={setError}
            />
          )}
        </section>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            rounded="md"
            colVariant="warning"
            onClick={onClose}
          >
            Cerrar
          </Button>
          <Button
            type="submit"
            size="sm"
            rounded="md"
            colVariant="success"
            disabled={!ready || busy}
          >
            {received ? "Registrar paquete" : "Dejar constancia"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
