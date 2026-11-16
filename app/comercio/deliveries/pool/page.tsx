"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Text, Title } from "complexes-next-components";
import ComercioModal from "../../_components/comercio-modal";
import { useComercioGuard } from "../../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { Button, SelectField } from "@/app/components/ui/form";
import { getBranches } from "../../branches/services/comercioBranchService";
import {
  JOB_STATUS_LABELS,
  PoolCandidate,
  PoolCard,
  VEHICLE_LABELS,
  acceptApplication,
  fmtMoney,
  getDeliveryPool,
  getPoolRequests,
  inviteFromPool,
  rejectApplication,
  setBranchHiring,
  withdrawInvitation,
} from "../services/comercioDeliveryService";

const inputCls =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800";

const toPay = (value: string) => (value.trim() === "" ? null : Number(value));

/**
 * Bolsa de repartidores, vista por el comercio.
 *
 * Antes solo se podía registrar a alguien que ya se conocía, con su correo.
 * Aquí se ve a quienes buscan trabajo cerca de la sucursal —los que lo
 * pidieron, ya identificados—, se les invita con la tarifa que se ofrece y se
 * responden las postulaciones. Al aceptar, la persona aparece en
 * "Repartidores" con su teléfono y su documento, como cualquier otro.
 */
export default function ComercioDeliveryPoolPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  useComercioGuard(() => router.push("/comercio/login"));

  const branchesQuery = useQuery({
    queryKey: ["comercio-branches"],
    queryFn: getBranches,
  });
  const branches = (branchesQuery.data ?? []).filter((b) => b.isActive);
  const [branchId, setBranchId] = useState("");

  useEffect(() => {
    if (!branchId && branches.length > 0) setBranchId(branches[0].id);
  }, [branchId, branches]);

  const branch = branches.find((b) => b.id === branchId) ?? null;

  const poolQuery = useQuery({
    queryKey: ["comercio-delivery-pool", branchId],
    queryFn: () => getDeliveryPool(branchId),
    enabled: !!branchId,
  });

  const requestsQuery = useQuery({
    queryKey: ["comercio-delivery-pool-requests"],
    queryFn: () => getPoolRequests(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["comercio-delivery-pool"] });
    queryClient.invalidateQueries({ queryKey: ["comercio-delivery-pool-requests"] });
    queryClient.invalidateQueries({ queryKey: ["comercio-deliveries"] });
    queryClient.invalidateQueries({ queryKey: ["comercio-branches"] });
  };

  const onError = (error: Error) => showAlert(error.message, "error");

  const hiringMut = useMutation({
    mutationFn: (hiring: boolean) =>
      setBranchHiring(branchId, { hiring, note: branch?.hiringNote ?? undefined }),
    onSuccess: invalidate,
    onError,
  });

  // ─── Invitar ───
  const [inviting, setInviting] = useState<PoolCandidate | null>(null);
  const [invite, setInvite] = useState({ message: "", pay: "", priority: "" });

  const inviteMut = useMutation({
    mutationFn: () =>
      inviteFromPool({
        deliveryId: inviting!.id,
        branchId,
        message: invite.message || undefined,
        payPerDelivery: toPay(invite.pay),
        payPerPriority: toPay(invite.priority),
      }),
    onSuccess: () => {
      showAlert("Invitación enviada. Te avisamos cuando responda.", "success");
      setInviting(null);
      setInvite({ message: "", pay: "", priority: "" });
      invalidate();
    },
    onError,
  });

  // ─── Aceptar postulación ───
  const [accepting, setAccepting] = useState<string | null>(null);
  const [acceptPay, setAcceptPay] = useState({ pay: "", priority: "" });

  const acceptMut = useMutation({
    mutationFn: () =>
      acceptApplication(accepting!, {
        payPerDelivery: toPay(acceptPay.pay),
        payPerPriority: toPay(acceptPay.priority),
      }),
    onSuccess: () => {
      showAlert("Listo: ya aparece en tus repartidores.", "success");
      setAccepting(null);
      setAcceptPay({ pay: "", priority: "" });
      invalidate();
    },
    onError,
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) => rejectApplication(id),
    onSuccess: invalidate,
    onError,
  });

  const withdrawMut = useMutation({
    mutationFn: (id: string) => withdrawInvitation(id),
    onSuccess: invalidate,
    onError,
  });

  const requests = requestsQuery.data ?? [];
  const applications = requests.filter(
    (r) => r.direction === "application" && r.status === "pending",
  );
  const sent = requests.filter(
    (r) => r.direction === "invitation" && r.status === "pending",
  );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <Title as="h1" size="xs" colVariant="on" font="semi">
            Bolsa de repartidores
          </Title>
          <Link
            href="/comercio/deliveries"
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            ← Mis repartidores
          </Link>
        </div>
        <Text size="sm" className="mb-6 text-slate-400">
          Repartidores que buscan trabajo cerca de tu sucursal (hasta 40 km).
          Antes de que acepten solo ves lo básico; su teléfono y su documento
          aparecen cuando empiezan a trabajar contigo.
        </Text>

        {/* Postulaciones primero: son las que esperan una respuesta tuya. */}
        {applications.length > 0 ? (
          <section className="mb-8">
            <Text size="sm" font="semi" className="text-slate-200">
              Se postularon ({applications.length})
            </Text>
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              {applications.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4"
                >
                  {request.delivery ? <CardBody card={request.delivery} /> : null}
                  <Text size="xs" className="mt-1 text-slate-300">
                    A {request.branchName ?? "tu sucursal"} ·{" "}
                    {new Date(request.createdAt).toLocaleDateString("es-CO")}
                  </Text>
                  {request.message ? (
                    <Text size="xs" className="mt-1 text-slate-200">
                      “{request.message}”
                    </Text>
                  ) : null}
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="xs"
                      rounded="md"
                      colVariant="success"
                      onClick={() => setAccepting(request.id)}
                    >
                      Aceptar
                    </Button>
                    <Button
                      size="xs"
                      rounded="md"
                      colVariant="default"
                      disabled={rejectMut.isLoading}
                      onClick={() => rejectMut.mutate(request.id)}
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="flex flex-wrap items-end gap-4">
          {branches.length > 1 ? (
            <div className="w-full max-w-xs">
              <SelectField
                options={branches.map((b) => ({ label: b.name, value: b.id }))}
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                helpText="Sucursal"
                sizeHelp="xs"
                inputSize="md"
                rounded="md"
              />
            </div>
          ) : null}

          {branch ? (
            <div className="flex items-center gap-2">
              <Badge colVariant={branch.hiringDeliveries ? "success" : "default"} size="xs">
                {branch.hiringDeliveries ? "Contratando" : "No está contratando"}
              </Badge>
              <Button
                size="xs"
                rounded="md"
                colVariant={branch.hiringDeliveries ? "default" : "success"}
                disabled={hiringMut.isLoading}
                onClick={() => hiringMut.mutate(!branch.hiringDeliveries)}
              >
                {branch.hiringDeliveries
                  ? "Dejar de buscar"
                  : "Recibir postulaciones"}
              </Button>
            </div>
          ) : null}
        </div>

        <section className="mt-6">
          <Text size="sm" font="semi" className="text-slate-200">
            Disponibles cerca de {branch?.name ?? "tu sucursal"}
          </Text>
          {branches.length === 0 ? (
            <Text size="sm" className="mt-2 text-slate-400">
              Necesitas una sucursal activa.{" "}
              <Link href="/comercio/branches" className="underline">
                Crear sucursal
              </Link>
            </Text>
          ) : poolQuery.isLoading ? (
            <Text size="sm" className="mt-2 text-slate-400">
              Buscando...
            </Text>
          ) : poolQuery.error ? (
            <Text size="sm" colVariant="danger" className="mt-2">
              {(poolQuery.error as Error).message}
            </Text>
          ) : (poolQuery.data ?? []).length === 0 ? (
            <Text size="sm" className="mt-2 text-slate-400">
              Por ahora no hay repartidores en la bolsa cerca de esta sucursal.
              Prende “Recibir postulaciones” para que te encuentren ellos.
            </Text>
          ) : (
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              {(poolQuery.data ?? []).map((candidate) => (
                <div
                  key={candidate.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <CardBody card={candidate} distanceKm={candidate.distanceKm} />
                  <div className="mt-3 flex items-center gap-2">
                    {candidate.canInvite ? (
                      <Button
                        size="xs"
                        rounded="md"
                        colVariant="success"
                        onClick={() => setInviting(candidate)}
                      >
                        Invitar
                      </Button>
                    ) : candidate.lastRequest ? (
                      <Text size="xs" className="text-slate-400">
                        {candidate.lastRequest.direction === "invitation"
                          ? "Invitación"
                          : "Postulación"}
                        : {JOB_STATUS_LABELS[candidate.lastRequest.status]}
                      </Text>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {sent.length > 0 ? (
          <section className="mt-8">
            <Text size="sm" font="semi" className="text-slate-200">
              Invitaciones enviadas
            </Text>
            <div className="mt-2 grid gap-2">
              {sent.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <Text size="sm" className="text-slate-200">
                    {request.delivery?.displayName ?? "Repartidor"} ·{" "}
                    {request.branchName ?? ""}
                    <span className="text-slate-400">
                      {" "}
                      · vence el{" "}
                      {new Date(request.expiresAt).toLocaleDateString("es-CO")}
                    </span>
                  </Text>
                  <Button
                    size="xs"
                    rounded="md"
                    colVariant="default"
                    disabled={withdrawMut.isLoading}
                    onClick={() => withdrawMut.mutate(request.id)}
                  >
                    Retirar
                  </Button>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <ComercioModal
        isOpen={!!inviting}
        onClose={() => setInviting(null)}
        title={`Invitar a ${inviting?.displayName ?? ""}`}
        className="!w-[94%] md:!w-[560px] max-w-[96vw]"
      >
        <div className="space-y-3 p-2">
          <Text size="xs" className="text-gray-500">
            A la sucursal {branch?.name}. La tarifa es lo que le pagarías por
            entrega; la plata no pasa por la plataforma, pero le deja ver lo
            que lleva ganado.
          </Text>
          <PayInputs
            pay={invite.pay}
            priority={invite.priority}
            onChange={(pay, priority) => setInvite({ ...invite, pay, priority })}
          />
          <label className="block text-xs text-gray-600">
            Mensaje (opcional)
            <textarea
              rows={3}
              maxLength={300}
              value={invite.message}
              onChange={(e) => setInvite({ ...invite, message: e.target.value })}
              className={inputCls}
            />
          </label>
          <Button
            colVariant="success"
            size="full"
            rounded="md"
            disabled={inviteMut.isLoading}
            onClick={() => inviteMut.mutate()}
          >
            {inviteMut.isLoading ? "Enviando..." : "Enviar invitación"}
          </Button>
        </div>
      </ComercioModal>

      <ComercioModal
        isOpen={!!accepting}
        onClose={() => setAccepting(null)}
        title="Aceptar postulación"
        className="!w-[94%] md:!w-[560px] max-w-[96vw]"
      >
        <div className="space-y-3 p-2">
          <Text size="xs" className="text-gray-500">
            Pon lo que le vas a pagar por entrega para que pueda ver lo que
            lleva ganado. Lo puedes cambiar después desde “Repartidores”.
          </Text>
          <PayInputs
            pay={acceptPay.pay}
            priority={acceptPay.priority}
            onChange={(pay, priority) => setAcceptPay({ pay, priority })}
          />
          <Button
            colVariant="success"
            size="full"
            rounded="md"
            disabled={acceptMut.isLoading}
            onClick={() => acceptMut.mutate()}
          >
            {acceptMut.isLoading ? "Guardando..." : "Aceptar"}
          </Button>
        </div>
      </ComercioModal>
    </div>
  );
}

function CardBody({ card, distanceKm }: { card: PoolCard; distanceKm?: number }) {
  return (
    <>
      <Text size="sm" font="semi" className="text-slate-100">
        {card.displayName}
        {card.vehicleType ? (
          <span className="text-slate-400"> · {VEHICLE_LABELS[card.vehicleType]}</span>
        ) : null}
      </Text>
      <Text size="xs" className="text-slate-400">
        {card.workCity ?? "Ciudad sin indicar"}
        {distanceKm !== undefined
          ? ` · a ${distanceKm.toLocaleString("es-CO")} km`
          : ""}
      </Text>
      <Text size="xs" className="mt-1 text-slate-300">
        {card.delivered} entrega{card.delivered === 1 ? "" : "s"} en la
        plataforma
        {card.completionRate !== null ? ` · ${card.completionRate}% cumplidas` : ""}
        {" · desde "}
        {new Date(card.memberSince).toLocaleDateString("es-CO", {
          month: "short",
          year: "numeric",
        })}
      </Text>
      {card.availabilityNote ? (
        <Text size="xs" className="mt-1 text-slate-300">
          🕒 {card.availabilityNote}
        </Text>
      ) : null}
      {card.workBio ? (
        <Text size="xs" className="mt-1 text-slate-400">
          {card.workBio}
        </Text>
      ) : null}
    </>
  );
}

function PayInputs({
  pay,
  priority,
  onChange,
}: {
  pay: string;
  priority: string;
  onChange: (pay: string, priority: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="block text-xs text-gray-600">
        Pago por entrega (COP)
        <input
          type="number"
          min={0}
          step={500}
          value={pay}
          placeholder="Sin registrar"
          onChange={(e) => onChange(e.target.value, priority)}
          className={inputCls}
        />
      </label>
      <label className="block text-xs text-gray-600">
        Extra si es directa (COP)
        <input
          type="number"
          min={0}
          step={500}
          value={priority}
          placeholder="0"
          onChange={(e) => onChange(pay, e.target.value)}
          className={inputCls}
        />
      </label>
      {pay !== "" ? (
        <p className="col-span-2 text-xs text-gray-500">
          Le aparecerá: {fmtMoney(Number(pay))} por entrega
          {priority ? ` · +${fmtMoney(Number(priority))} si es directa` : ""}
        </p>
      ) : null}
    </div>
  );
}
