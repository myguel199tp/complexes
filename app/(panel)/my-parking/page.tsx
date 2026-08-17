"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaCar, FaCarTunnel } from "react-icons/fa6";
import { FaMotorcycle } from "react-icons/fa";
import {
  Button,
  InputField,
  SelectField,
  Title,
} from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  assignParkingSpot,
  createParkingSpot,
  getParkingAvailability,
  getParkingSpots,
  getParkingVehicles,
  getVisitorOccupancy,
  ParkingSpot,
  VisitorSpotOccupancy,
  ParkingSpotType,
  PARKING_SPOT_TYPES,
  releaseParkingSpot,
  setParkingSpotActive,
} from "./services/parkingSpotService";

const TYPE_LABEL: Record<ParkingSpotType, string> = {
  resident: "Residente",
  visitor: "Visitante",
  motorcycle: "Moto",
  disabled: "Movilidad reducida",
};

/**
 * Inventario de celdas del conjunto.
 *
 * El resumen de visitantes cruza las celdas activas de ese tipo contra las
 * visitas que están adentro con vehículo, que es lo que portería necesita para
 * decidir si deja entrar el siguiente carro.
 */
export default function MyParkingPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [typeFilter, setTypeFilter] = useState<ParkingSpotType | "">("");
  const [form, setForm] = useState({
    code: "",
    zone: "",
    type: "resident" as ParkingSpotType,
  });
  const [assigning, setAssigning] = useState<string | null>(null);

  const availabilityQuery = useQuery({
    queryKey: ["parking-availability", conjuntoId],
    queryFn: () => getParkingAvailability(conjuntoId),
    enabled: !!conjuntoId,
  });

  const spotsQuery = useQuery({
    queryKey: ["parking-spots", conjuntoId, typeFilter],
    queryFn: () =>
      getParkingSpots(conjuntoId, {
        type: typeFilter || undefined,
      }),
    enabled: !!conjuntoId,
  });

  /**
   * Quién ocupa cada celda de visitantes. Se refresca sola porque cambia con
   * cada ingreso y cada salida de portería, no con lo que se haga en esta
   * pantalla.
   */
  const occupancyQuery = useQuery({
    queryKey: ["visitor-occupancy", conjuntoId],
    queryFn: () => getVisitorOccupancy(conjuntoId),
    enabled: !!conjuntoId,
    refetchInterval: 30_000,
  });

  // Solo se cargan los vehículos cuando se va a asignar: es una lista grande y
  // no tiene por qué pesar en la carga inicial de la pantalla.
  const vehiclesQuery = useQuery({
    queryKey: ["parking-vehicles", conjuntoId],
    queryFn: () => getParkingVehicles(conjuntoId),
    enabled: !!conjuntoId && !!assigning,
  });

  // Los que ya ocupan una celda se excluyen: el backend los rechaza y es mejor
  // no ofrecerlos que explicar el error después.
  const vehicleOptions = useMemo(() => {
    return (vehiclesQuery.data ?? [])
      .filter((v) => !v.spot)
      .map((v) => ({
        value: v.id,
        label: [
          v.plaque,
          v.apartment ? `· Apto ${v.apartment}` : null,
          v.tower ? `(Torre ${v.tower})` : null,
          v.type === "moto" ? "· Moto" : null,
        ]
          .filter(Boolean)
          .join(" "),
      }));
  }, [vehiclesQuery.data]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["parking-spots"] });
    queryClient.invalidateQueries({ queryKey: ["parking-availability"] });
    queryClient.invalidateQueries({ queryKey: ["parking-vehicles"] });
  };

  const createMut = useMutation({
    mutationFn: () =>
      createParkingSpot(conjuntoId, {
        code: form.code.trim(),
        zone: form.zone.trim() || undefined,
        type: form.type,
      }),
    onSuccess: () => {
      showAlert("Celda creada", "success");
      setForm({ code: "", zone: "", type: form.type });
      refresh();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const assignMut = useMutation({
    mutationFn: (p: { id: string; vehicleId: string }) =>
      assignParkingSpot(conjuntoId, p.id, p.vehicleId),
    onSuccess: () => {
      showAlert("Celda asignada", "success");
      setAssigning(null);
      refresh();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const releaseMut = useMutation({
    mutationFn: (id: string) => releaseParkingSpot(conjuntoId, id),
    onSuccess: () => {
      showAlert("Celda liberada", "success");
      refresh();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const activeMut = useMutation({
    mutationFn: (p: { id: string; isActive: boolean }) =>
      setParkingSpotActive(conjuntoId, p.id, p.isActive),
    onSuccess: refresh,
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const availability = availabilityQuery.data;
  const spots = spotsQuery.data ?? [];

  // Celda → visita que la retiene, para poder decir quién la ocupa y no solo
  // cuántas quedan.
  const occupancyBySpot = useMemo(() => {
    const map = new Map<string, VisitorSpotOccupancy>();
    (occupancyQuery.data ?? []).forEach((o) => map.set(o.spotId, o));
    return map;
  }, [occupancyQuery.data]);

  return (
    <div className="w-full p-2">
      <Title size="sm" font="bold" className="text-white">
        Parqueaderos
      </Title>
      <p className="mt-1 text-sm text-slate-400">
        Inventario de celdas del conjunto y cupos disponibles para visitantes.
      </p>

      {/* RESUMEN */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          label="Celdas registradas"
          value={availability?.total ?? 0}
          hint={`${availability?.active ?? 0} en servicio`}
        />
        <SummaryCard
          label="Cupos de visitantes"
          value={availability?.visitors.capacity ?? 0}
          hint="celdas activas"
        />
        <SummaryCard
          label="Ocupados ahora"
          value={availability?.visitors.occupied ?? 0}
          hint="celdas con visitante"
        />
        <SummaryCard
          label="Disponibles"
          value={availability?.visitors.available ?? 0}
          hint={
            availability?.visitors.overCapacity
              ? "hay vehículos en sobrecupo"
              : "cupos libres"
          }
          danger={availability?.visitors.overCapacity}
        />
      </div>

      {availability?.visitors.overCapacity ? (
        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          {availability.visitors.overcapacityVehicles}{" "}
          {availability.visitors.overcapacityVehicles === 1
            ? "vehículo de visita entró"
            : "vehículos de visita entraron"}{" "}
          sin celda porque no quedaba ninguna libre. Puede ser que falten celdas
          por cargar en el inventario, o que haya carros parqueados fuera de las
          zonas asignadas.
        </div>
      ) : null}

      {/* CREAR CELDA */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <Title size="xs" font="semi" className="text-white">
          Agregar celda
        </Title>

        <form
          className="mt-4 grid gap-3 md:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.code.trim()) {
              showAlert("El código de la celda es obligatorio", "error");
              return;
            }
            createMut.mutate();
          }}
        >
          <InputField
            placeholder="Código (ej. A-45)"
            rounded="md"
            value={form.code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((p) => ({ ...p, code: e.target.value }))
            }
          />

          <InputField
            placeholder="Zona o sótano (opcional)"
            rounded="md"
            value={form.zone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((p) => ({ ...p, zone: e.target.value }))
            }
          />

          <SelectField
            id="type"
            rounded="md"
            options={PARKING_SPOT_TYPES}
            value={form.type}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                type: e.target.value as ParkingSpotType,
              }))
            }
          />

          <Button
            type="submit"
            rounded="md"
            colVariant="success"
            disabled={createMut.isPending}
          >
            {createMut.isPending ? "Guardando..." : "Agregar"}
          </Button>
        </form>
      </div>

      {/* FILTRO */}
      <div className="mt-8 flex flex-wrap gap-2">
        <FilterChip
          active={typeFilter === ""}
          onClick={() => setTypeFilter("")}
          label="Todas"
        />
        {PARKING_SPOT_TYPES.map((t) => (
          <FilterChip
            key={t.value}
            active={typeFilter === t.value}
            onClick={() => setTypeFilter(t.value)}
            label={t.label}
          />
        ))}
      </div>

      {/* LISTADO */}
      <div className="mt-4">
        {spotsQuery.isLoading ? (
          <p className="text-sm text-slate-400">Cargando celdas...</p>
        ) : spots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="text-slate-300">
              {typeFilter
                ? "No hay celdas de este tipo."
                : "Todavía no hay celdas registradas."}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Carga el inventario para poder saber cuántos cupos de visitante
              quedan libres en portería.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {spots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                occupancy={occupancyBySpot.get(spot.id)}
                isAssigning={assigning === spot.id}
                vehicleOptions={vehicleOptions}
                vehiclesLoading={vehiclesQuery.isLoading}
                onStartAssign={() => setAssigning(spot.id)}
                onCancelAssign={() => setAssigning(null)}
                onAssign={(vehicleId) =>
                  assignMut.mutate({ id: spot.id, vehicleId })
                }
                onRelease={() => releaseMut.mutate(spot.id)}
                onToggleActive={() =>
                  activeMut.mutate({ id: spot.id, isActive: !spot.isActive })
                }
                busy={assignMut.isPending || releaseMut.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  danger,
}: {
  label: string;
  value: number;
  hint: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <span className="text-xs text-slate-400">{label}</span>
      <span
        className={`mt-1 block text-3xl font-bold ${
          danger ? "text-amber-300" : "text-slate-100"
        }`}
      >
        {value}
      </span>
      <span className="text-xs text-slate-500">{hint}</span>
    </div>
  );
}

/** Hora corta y local; el dato viaja en ISO desde el backend. */
function formatMoment(value: string | null) {
  if (!value) return "hace un momento";

  return new Date(value).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active
          ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
          : "border-white/10 text-slate-400 hover:border-cyan-400/40"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * La zona es texto libre, así que el sótano se detecta por el nombre que le
 * pusieron a la celda (sin acentos y aceptando la escritura con z).
 */
function isBasement(zone?: string) {
  if (!zone) return false;

  const normalized = zone
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return /([sz]otano|subterran)/.test(normalized);
}

/**
 * Estado de la celda a simple vista:
 * - visitante ocupado → rojo, visitante libre → verde
 * - residente con vehículo → azul, residente sin asignar → gris
 */
function spotIconStyle(spot: ParkingSpot, occupied: boolean) {
  if (spot.type === "visitor") {
    return occupied
      ? { color: "text-red-400", label: "Ocupada por un visitante" }
      : { color: "text-emerald-400", label: "Libre" };
  }

  return spot.vehicleId
    ? { color: "text-blue-400", label: "Asignada" }
    : { color: "text-slate-500", label: "Sin asignar" };
}

function SpotCard({
  spot,
  occupancy,
  isAssigning,
  vehicleOptions,
  vehiclesLoading,
  onStartAssign,
  onCancelAssign,
  onAssign,
  onRelease,
  onToggleActive,
  busy,
}: {
  spot: ParkingSpot;
  /** Visita que retiene la celda. Solo aplica a las rotativas de visitantes. */
  occupancy?: VisitorSpotOccupancy;
  isAssigning: boolean;
  vehicleOptions: { value: string; label: string }[];
  vehiclesLoading: boolean;
  onStartAssign: () => void;
  onCancelAssign: () => void;
  onAssign: (vehicleId: string) => void;
  onRelease: () => void;
  onToggleActive: () => void;
  busy: boolean;
}) {
  const [vehicle, setVehicle] = useState("");
  const asignada = !!spot.vehicleId;
  // Las celdas de visitantes son rotativas: el backend rechaza asignarlas.
  const asignable = spot.type !== "visitor";

  // Moto manda sobre el resto: la celda puede estar en sótano y aun así lo que
  // hay que ver es que es de motos.
  const esMoto = spot.type === "motorcycle" || spot.vehicle?.type === "moto";
  const Icon = esMoto
    ? FaMotorcycle
    : isBasement(spot.zone)
      ? FaCarTunnel
      : FaCar;
  const icono = spotIconStyle(spot, !!occupancy);

  return (
    <div
      className={`rounded-2xl border p-4 ${
        spot.isActive
          ? "border-white/10 bg-white/[0.04]"
          : "border-dashed border-white/10 bg-white/[0.02] opacity-70"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Icon
            className={`text-4xl shrink-0 ${icono.color}`}
            aria-label={`${esMoto ? "Moto" : "Carro"} · ${icono.label}`}
            title={icono.label}
          />
          <div>
            <span className="text-lg font-bold text-slate-100">
              {spot.code}
            </span>
            {spot.zone ? (
              <span className="ml-2 text-xs text-slate-500">{spot.zone}</span>
            ) : null}
          </div>
        </div>

        <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[11px] font-semibold text-cyan-200">
          {TYPE_LABEL[spot.type]}
        </span>
      </div>

      {/*
        Una celda rotativa no tiene vehículo asignado, pero sí puede tener un
        visitante encima ahora mismo. Antes esta tarjeta solo decía "Rotativa" y
        no había forma de saber cuál de los puestos estaba ocupado.
      */}
      {occupancy ? (
        <div className="mt-2 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2">
          <p className="text-sm font-semibold text-cyan-100">
            {occupancy.plaque ?? "Sin placa"} · Apto {occupancy.apartment}
          </p>
          <p className="text-xs text-cyan-200/80">
            {occupancy.namevisit} —{" "}
            {occupancy.status === "INSIDE"
              ? `adentro desde ${formatMoment(occupancy.entryTime)}`
              : occupancy.status === "PENDING"
                ? "en portería, esperando autorización"
                : "autorizado, aún no ingresa"}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-400">
          {asignada
            ? [
                spot.vehicle?.plaque ?? "Vehículo asignado",
                spot.vehicle?.relation?.apartment
                  ? `· Apto ${spot.vehicle.relation.apartment}`
                  : null,
              ]
                .filter(Boolean)
                .join(" ")
            : asignable
              ? "Sin asignar"
              : "Libre"}
        </p>
      )}

      {!spot.isActive ? (
        <p className="mt-1 text-xs text-amber-300">Fuera de servicio</p>
      ) : null}

      {isAssigning ? (
        <div className="mt-3 space-y-2">
          {vehiclesLoading ? (
            <p className="text-xs text-slate-400">Cargando vehículos...</p>
          ) : vehicleOptions.length === 0 ? (
            <p className="text-xs text-slate-400">
              No hay vehículos sin celda. Regístralos en la ficha del residente.
            </p>
          ) : (
            <SelectField
              id={`vehicle-${spot.id}`}
              rounded="md"
              defaultOption="Selecciona el vehículo"
              options={vehicleOptions}
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
            />
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              rounded="md"
              colVariant="success"
              disabled={!vehicle || busy}
              onClick={() => onAssign(vehicle)}
            >
              Confirmar
            </Button>
            <Button
              size="sm"
              rounded="md"
              colVariant="danger"
              onClick={onCancelAssign}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {asignable && !asignada ? (
            <Button
              size="sm"
              rounded="md"
              onClick={onStartAssign}
              disabled={!spot.isActive}
            >
              Asignar
            </Button>
          ) : null}

          {asignada ? (
            <Button
              size="sm"
              rounded="md"
              colVariant="warning"
              onClick={onRelease}
              disabled={busy}
            >
              Liberar
            </Button>
          ) : null}

          <Button size="sm" rounded="md" onClick={onToggleActive}>
            {spot.isActive ? "Sacar de servicio" : "Reactivar"}
          </Button>
        </div>
      )}
    </div>
  );
}
