"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  InputField,
  SelectField,
  Text,
  Title,
} from "complexes-next-components";

import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { allUserService } from "@/app/(panel)/my-new-user/services/usersService";
import {
  getParkingSpots,
  ParkingSpot,
} from "@/app/(panel)/my-parking/services/parkingSpotService";

import {
  cancelParkingRental,
  createParkingRental,
  endParkingRental,
  getParkingRentals,
  ParkingRental,
  RENTAL_STATUS_LABEL,
  RENTAL_TENANT_TYPES,
  RentalStatus,
  RentalTenantType,
} from "../services/parkingRentalService";

/**
 * Celdas que el conjunto arrienda.
 *
 * Vive bajo `my-citofonia` y no bajo `my-parking` porque quien tropieza con el
 * problema es portería: una celda ocupada todos los días que no pertenece a
 * ningún apartamento. El inventario la daba por libre y el vigilante podía
 * mandarle un carro de visita encima.
 *
 * El canon no se cobra aquí: cada mes el backend genera una cuota de tipo "Pago
 * de parqueadero" en la cartera de la unidad, con su mora y su comprobante. Por
 * eso esta pantalla muestra el último período cobrado pero no tiene botón de
 * pago: el pago se hace donde se hacen todos los demás.
 */
export default function ParkingRentalsPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<RentalStatus | "">("ACTIVE");
  const [showForm, setShowForm] = useState(false);

  const rentalsQuery = useQuery({
    queryKey: ["parking-rentals", conjuntoId, statusFilter],
    queryFn: () =>
      getParkingRentals(conjuntoId, {
        status: statusFilter || undefined,
      }),
    enabled: !!conjuntoId,
  });

  /**
   * El inventario completo se pide solo cuando se va a firmar: es la única
   * parte de la pantalla que lo necesita y no tiene por qué pesar en la carga
   * inicial de un listado que casi siempre se abre solo a consultar.
   */
  const spotsQuery = useQuery({
    queryKey: ["parking-spots", conjuntoId, ""],
    queryFn: () => getParkingSpots(conjuntoId),
    enabled: !!conjuntoId && showForm,
  });

  const unitsQuery = useQuery({
    queryKey: ["parking-rental-units", conjuntoId],
    queryFn: () => allUserService(conjuntoId, 1, 500),
    enabled: !!conjuntoId && showForm,
  });

  const rentals = rentalsQuery.data ?? [];

  /**
   * Celdas que hoy tienen contrato vivo. Se calcula sobre los contratos
   * `ACTIVE` y no sobre el filtro visible, porque si el usuario está mirando
   * "Terminados" el formulario seguiría ofreciendo celdas ya arrendadas.
   */
  const activeRentalsQuery = useQuery({
    queryKey: ["parking-rentals", conjuntoId, "ACTIVE"],
    queryFn: () => getParkingRentals(conjuntoId, { status: "ACTIVE" }),
    enabled: !!conjuntoId,
  });

  const rentedSpotIds = useMemo(
    () => new Set((activeRentalsQuery.data ?? []).map((r) => r.spotId)),
    [activeRentalsQuery.data],
  );

  /**
   * Solo se ofrecen las celdas que el backend aceptaría: en servicio, sin
   * vehículo de residente asignado y sin otro contrato encima. Es mejor no
   * mostrarlas que explicar el 409 después.
   */
  const spotOptions = useMemo(() => {
    return (spotsQuery.data ?? [])
      .filter(
        (spot: ParkingSpot) =>
          spot.isActive && !spot.vehicleId && !rentedSpotIds.has(spot.id),
      )
      .map((spot: ParkingSpot) => ({
        value: spot.id,
        label: spot.zone ? `${spot.code} · ${spot.zone}` : spot.code,
      }));
  }, [spotsQuery.data, rentedSpotIds]);

  const unitOptions = useMemo(() => {
    return (unitsQuery.data?.data ?? [])
      .filter((u) => !!u.apartment)
      .map((u) => ({
        value: u.id,
        label: [
          `Apto ${u.apartment}`,
          u.tower ? `· Torre ${u.tower}` : null,
          u.user?.name ? `· ${u.user.name}` : null,
        ]
          .filter(Boolean)
          .join(" "),
      }));
  }, [unitsQuery.data]);

  const activos = activeRentalsQuery.data ?? [];

  const ingresoMensual = activos.reduce((sum, r) => sum + (r.monthlyFee || 0), 0);
  const externos = activos.filter((r) => r.tenantType === "EXTERNAL").length;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["parking-rentals"] });
    // El cupo de visitantes cambia en cuanto se firma o se cierra un contrato.
    queryClient.invalidateQueries({ queryKey: ["parking-availability"] });
    queryClient.invalidateQueries({ queryKey: ["visitor-free-spots"] });
    queryClient.invalidateQueries({ queryKey: ["parking-spots"] });
  };

  const endMut = useMutation({
    mutationFn: (id: string) => endParkingRental(conjuntoId, id),
    onSuccess: () => {
      showAlert("Contrato terminado; la celda vuelve al inventario", "success");
      refresh();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelParkingRental(conjuntoId, id),
    onSuccess: () => {
      showAlert("Contrato anulado", "success");
      refresh();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  return (
    <div className="w-full p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Title size="md" font="bold" as="h3" colVariant="on">
            Parqueaderos en alquiler
          </Title>
          <p className="mt-1 text-sm text-slate-400">
            Celdas que el conjunto arrienda. Mientras el contrato esté vigente
            la celda no se le ofrece a portería ni se puede asignar a un
            residente.
          </p>
        </div>

        {/* Vuelta al inventario: las celdas que aquí se arriendan se crean allá. */}
        <Button
          size="sm"
          rounded="md"
          onClick={() => router.push(route.myParking)}
        >
          Ver inventario de celdas
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <SummaryCard
          label="Contratos vigentes"
          value={String(activos.length)}
          hint="celdas arrendadas ahora"
        />
        <SummaryCard
          label="Canon mensual"
          value={`$${ingresoMensual.toLocaleString("es-CO")}`}
          hint="suma de los contratos vigentes"
        />
        <SummaryCard
          label="Arrendatarios externos"
          value={String(externos)}
          hint={
            externos > 0
              ? "se cobran por fuera de la app"
              : "todos generan cuota"
          }
          warn={externos > 0}
        />
      </div>

      {externos > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          Los arrendatarios sin apartamento no generan cuota automática: la
          cartera cuelga de la unidad, así que un cobro sin unidad no aparecería
          en ningún listado ni proceso de mora. Su canon queda registrado aquí
          para cobrarlo por fuera.
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <FilterChip
          active={statusFilter === "ACTIVE"}
          onClick={() => setStatusFilter("ACTIVE")}
          label="Vigentes"
        />
        <FilterChip
          active={statusFilter === "ENDED"}
          onClick={() => setStatusFilter("ENDED")}
          label="Terminados"
        />
        <FilterChip
          active={statusFilter === "CANCELLED"}
          onClick={() => setStatusFilter("CANCELLED")}
          label="Anulados"
        />
        <FilterChip
          active={statusFilter === ""}
          onClick={() => setStatusFilter("")}
          label="Todos"
        />

        <div className="ml-auto">
          <Button
            size="sm"
            rounded="md"
            colVariant={showForm ? "danger" : "success"}
            onClick={() => setShowForm((p) => !p)}
          >
            {showForm ? "Cancelar" : "Arrendar una celda"}
          </Button>
        </div>
      </div>

      {showForm ? (
        <RentalForm
          spotOptions={spotOptions}
          unitOptions={unitOptions}
          loadingSpots={spotsQuery.isLoading}
          loadingUnits={unitsQuery.isLoading}
          onCreated={() => {
            setShowForm(false);
            setStatusFilter("ACTIVE");
            refresh();
          }}
          conjuntoId={conjuntoId}
        />
      ) : null}

      <div className="mt-6">
        {rentalsQuery.isLoading ? (
          <Text size="sm">Cargando contratos…</Text>
        ) : rentalsQuery.error ? (
          <Text size="sm" className="text-red-500">
            {(rentalsQuery.error as Error).message}
          </Text>
        ) : rentals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="text-slate-300">
              {statusFilter === "ACTIVE"
                ? "No hay celdas arrendadas."
                : "No hay contratos en este estado."}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Carga aquí los arriendos que hoy llevas por fuera: hasta que
              existan, esas celdas le siguen apareciendo libres a portería.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rentals.map((rental) => (
              <RentalCard
                key={rental.id}
                rental={rental}
                busy={endMut.isPending || cancelMut.isPending}
                onEnd={() => endMut.mutate(rental.id)}
                onCancel={() => cancelMut.mutate(rental.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Hoy en `YYYY-MM-DD`, que es el formato que espera el backend. */
function today() {
  return new Date().toISOString().slice(0, 10);
}

function RentalForm({
  spotOptions,
  unitOptions,
  loadingSpots,
  loadingUnits,
  onCreated,
  conjuntoId,
}: {
  spotOptions: { value: string; label: string }[];
  unitOptions: { value: string; label: string }[];
  loadingSpots: boolean;
  loadingUnits: boolean;
  onCreated: () => void;
  conjuntoId: string;
}) {
  const showAlert = useAlertStore((s) => s.showAlert);

  const [form, setForm] = useState({
    spotId: "",
    tenantType: "RESIDENT" as RentalTenantType,
    relationId: "",
    tenantName: "",
    tenantDocument: "",
    tenantPhone: "",
    plate: "",
    startDate: today(),
    endDate: "",
    monthlyFee: "",
    billingDay: "1",
    notes: "",
  });

  const esResidente = form.tenantType === "RESIDENT";

  const createMut = useMutation({
    mutationFn: () =>
      createParkingRental(conjuntoId, {
        spotId: form.spotId,
        tenantType: form.tenantType,
        relationId: esResidente ? form.relationId : undefined,
        tenantName: form.tenantName.trim() || undefined,
        tenantDocument: form.tenantDocument.trim() || undefined,
        tenantPhone: form.tenantPhone.trim() || undefined,
        plate: form.plate.trim() || undefined,
        startDate: form.startDate,
        // Vacío es contrato indefinido, no una fecha en blanco.
        endDate: form.endDate || undefined,
        monthlyFee: Number(form.monthlyFee || 0),
        billingDay: Number(form.billingDay || 1),
        notes: form.notes.trim() || undefined,
      }),
    onSuccess: () => {
      showAlert("Contrato creado", "success");
      onCreated();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.spotId) {
      showAlert("Selecciona la celda que se va a arrendar", "error");
      return;
    }

    if (esResidente && !form.relationId) {
      showAlert("Selecciona la unidad arrendataria", "error");
      return;
    }

    if (!esResidente && !form.tenantName.trim()) {
      showAlert("El nombre del arrendatario externo es obligatorio", "error");
      return;
    }

    createMut.mutate();
  };

  return (
    <form
      onSubmit={submit}
      className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5"
    >
      <Title size="xs" font="semi" className="text-white">
        Nuevo contrato
      </Title>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-xs text-slate-400">Celda</label>
          {loadingSpots ? (
            <p className="text-xs text-slate-400">Cargando celdas…</p>
          ) : spotOptions.length === 0 ? (
            <p className="text-xs text-slate-400">
              No hay celdas libres. Una celda asignada a un vehículo o ya
              arrendada no se puede arrendar.
            </p>
          ) : (
            <SelectField
              id="spotId"
              rounded="md"
              defaultOption="Selecciona la celda"
              options={spotOptions}
              value={form.spotId}
              onChange={(e) => set("spotId")(e.target.value)}
            />
          )}
        </div>

        <div>
          <label className="text-xs text-slate-400">Arrendatario</label>
          <SelectField
            id="tenantType"
            rounded="md"
            options={RENTAL_TENANT_TYPES}
            value={form.tenantType}
            onChange={(e) => set("tenantType")(e.target.value)}
          />
        </div>

        {esResidente ? (
          <div>
            <label className="text-xs text-slate-400">Unidad</label>
            {loadingUnits ? (
              <p className="text-xs text-slate-400">Cargando unidades…</p>
            ) : (
              <SelectField
                id="relationId"
                rounded="md"
                defaultOption="Selecciona la unidad"
                options={unitOptions}
                value={form.relationId}
                onChange={(e) => set("relationId")(e.target.value)}
              />
            )}
          </div>
        ) : (
          <div>
            <label className="text-xs text-slate-400">Nombre</label>
            <InputField
              placeholder="Nombre del arrendatario"
              rounded="md"
              value={form.tenantName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                set("tenantName")(e.target.value)
              }
            />
          </div>
        )}

        <InputField
          placeholder="Placa (opcional)"
          rounded="md"
          value={form.plate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            set("plate")(e.target.value)
          }
        />

        <InputField
          placeholder="Documento (opcional)"
          rounded="md"
          value={form.tenantDocument}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            set("tenantDocument")(e.target.value)
          }
        />

        <InputField
          placeholder="Teléfono (opcional)"
          rounded="md"
          value={form.tenantPhone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            set("tenantPhone")(e.target.value)
          }
        />

        <div>
          <label className="text-xs text-slate-400">Inicio</label>
          <InputField
            type="date"
            rounded="md"
            value={form.startDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              set("startDate")(e.target.value)
            }
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">
            Fin (vacío = indefinido)
          </label>
          <InputField
            type="date"
            rounded="md"
            value={form.endDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              set("endDate")(e.target.value)
            }
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">Canon mensual</label>
          <InputField
            type="number"
            placeholder="Ej. 180000"
            rounded="md"
            value={form.monthlyFee}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              set("monthlyFee")(e.target.value)
            }
          />
        </div>

        <div>
          {/*
            Tope 28 porque el 29, 30 y 31 no existen todos los meses: un
            vencimiento el 30 no tendría fecha válida en febrero.
          */}
          <label className="text-xs text-slate-400">
            Día de cobro (1 a 28)
          </label>
          <InputField
            type="number"
            min={1}
            max={28}
            rounded="md"
            value={form.billingDay}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              set("billingDay")(e.target.value)
            }
          />
        </div>

        <InputField
          placeholder="Notas (opcional)"
          rounded="md"
          value={form.notes}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            set("notes")(e.target.value)
          }
        />
      </div>

      {esResidente ? (
        <p className="mt-3 text-xs text-slate-500">
          Cada mes se generará una cuota de &quot;Pago de parqueadero&quot; en la
          cartera de esta unidad, con su vencimiento, su mora y su comprobante.
        </p>
      ) : (
        <p className="mt-3 text-xs text-amber-300/80">
          Un arrendatario externo no genera cuota: el canon queda registrado
          aquí para cobrarlo por fuera de la app.
        </p>
      )}

      <div className="mt-4">
        <Button
          type="submit"
          rounded="md"
          colVariant="success"
          disabled={createMut.isPending}
        >
          {createMut.isPending ? "Guardando…" : "Crear contrato"}
        </Button>
      </div>
    </form>
  );
}

function RentalCard({
  rental,
  busy,
  onEnd,
  onCancel,
}: {
  rental: ParkingRental;
  busy: boolean;
  onEnd: () => void;
  onCancel: () => void;
}) {
  const vigente = rental.status === "ACTIVE";
  const externo = rental.tenantType === "EXTERNAL";

  return (
    <div
      className={`rounded-2xl border p-4 ${
        vigente
          ? "border-white/10 bg-white/[0.04]"
          : "border-dashed border-white/10 bg-white/[0.02] opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-lg font-bold text-slate-100">
            {rental.spot?.code ?? "Celda"}
          </span>
          {rental.spot?.zone ? (
            <span className="ml-2 text-xs text-slate-500">
              {rental.spot.zone}
            </span>
          ) : null}
        </div>

        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            vigente
              ? "bg-emerald-500/15 text-emerald-200"
              : "bg-slate-500/20 text-slate-300"
          }`}
        >
          {RENTAL_STATUS_LABEL[rental.status]}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-200">
        {rental.tenantName}
        {rental.relation?.apartment ? (
          <span className="text-slate-400"> · Apto {rental.relation.apartment}</span>
        ) : null}
      </p>

      <p className="text-xs text-slate-400">
        {externo ? "Externo" : "Unidad del conjunto"}
        {rental.plate ? ` · ${rental.plate}` : ""}
      </p>

      <p className="mt-2 text-sm text-slate-300">
        ${(rental.monthlyFee || 0).toLocaleString("es-CO")} / mes · vence el{" "}
        {rental.billingDay}
      </p>

      <p className="text-xs text-slate-500">
        {rental.startDate?.slice(0, 10)} →{" "}
        {rental.endDate ? rental.endDate.slice(0, 10) : "indefinido"}
      </p>

      {/*
        El último período cobrado es la única forma de ver desde esta pantalla
        que el cobro automático está corriendo. El detalle del pago vive en la
        cartera de la unidad, no aquí.
      */}
      {!externo ? (
        <p className="mt-1 text-xs text-slate-500">
          {rental.lastBilledPeriod
            ? `Último cobro generado: ${rental.lastBilledPeriod}`
            : "Todavía no se ha generado ninguna cuota"}
        </p>
      ) : (
        <p className="mt-1 text-xs text-amber-300/70">
          No genera cuota automática
        </p>
      )}

      {vigente ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            rounded="md"
            colVariant="warning"
            disabled={busy}
            onClick={onEnd}
          >
            Terminar
          </Button>
          <Button
            size="sm"
            rounded="md"
            colVariant="danger"
            disabled={busy}
            onClick={onCancel}
          >
            Anular
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  warn,
}: {
  label: string;
  value: string;
  hint: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <span className="text-xs text-slate-400">{label}</span>
      <span
        className={`mt-1 block text-2xl font-bold ${
          warn ? "text-amber-300" : "text-slate-100"
        }`}
      >
        {value}
      </span>
      <span className="text-xs text-slate-500">{hint}</span>
    </div>
  );
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
