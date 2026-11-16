"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Text, Title } from "complexes-next-components";
import { Button } from "@/app/components/ui/form";
import { cityOptionsFor } from "@/app/helpers/countryCity";
import { useDeliveryGuard } from "../_lib/delivery-auth";
import DeliveryNav from "../_components/DeliveryNav";
import {
  JOB_STATUS_LABELS,
  applyToBranch,
  fmtMoney,
  getDeliveryProfile,
  getHiringBranches,
  getMyJobRequests,
  getMyLinks,
  leaveLink,
  respondInvitation,
  updateWorkProfile,
  withdrawApplication,
} from "../services/deliveryOrdersService";

/** El país de la bolsa: hoy solo Colombia (ver ENABLED_COUNTRY_CODES). */
const WORK_COUNTRY = "Colombia";

const payText = (perDelivery: number | null, perPriority: number | null) =>
  perDelivery === null
    ? "Tarifa por acordar"
    : `${fmtMoney(perDelivery)} por entrega${
        perPriority ? ` · +${fmtMoney(perPriority)} si es directa` : ""
      }`;

/**
 * "Trabajo": dónde trabaja, la bolsa y sus solicitudes.
 *
 * Antes la única forma de repartir era que un comercio que ya lo conocía lo
 * invitara con su correo. Aquí la persona decide si aparece en la bolsa, ve
 * qué comercios contratan cerca, se postula, responde invitaciones y puede
 * dejar un local por su cuenta.
 */
export default function DeliveryJobsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useDeliveryGuard(() => router.push("/delivery/login"));
  const ready = session !== null;

  const { data: profile } = useQuery({
    queryKey: ["delivery_profile"],
    queryFn: getDeliveryProfile,
    enabled: ready,
  });

  const { data: links } = useQuery({
    queryKey: ["delivery_links"],
    queryFn: getMyLinks,
    enabled: ready,
  });

  const { data: requests } = useQuery({
    queryKey: ["delivery_job_requests"],
    queryFn: getMyJobRequests,
    enabled: ready,
  });

  const hasCity = !!profile?.workCity;
  const branchesQuery = useQuery({
    queryKey: ["delivery_hiring_branches", profile?.workCity],
    queryFn: getHiringBranches,
    enabled: ready && hasCity,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["delivery_job_requests"] });
    queryClient.invalidateQueries({ queryKey: ["delivery_hiring_branches"] });
    queryClient.invalidateQueries({ queryKey: ["delivery_links"] });
    queryClient.invalidateQueries({ queryKey: ["delivery_profile"] });
  };

  // ─── Perfil de la bolsa ───
  const cityOptions = useMemo(() => cityOptionsFor("CO"), []);
  const [form, setForm] = useState({
    workCity: "",
    availabilityNote: "",
    workBio: "",
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      workCity: profile.workCity ?? "",
      availabilityNote: profile.availabilityNote ?? "",
      workBio: profile.workBio ?? "",
    });
  }, [profile]);

  const profileMut = useMutation({
    mutationFn: (input: Parameters<typeof updateWorkProfile>[0]) =>
      updateWorkProfile(input),
    onSuccess: invalidate,
  });

  const saveProfile = (openToWork?: boolean) =>
    profileMut.mutate({
      workCity: form.workCity,
      workCountry: WORK_COUNTRY,
      availabilityNote: form.availabilityNote,
      workBio: form.workBio,
      ...(openToWork === undefined ? {} : { openToWork }),
    });

  // ─── Acciones ───
  const [applyMessage, setApplyMessage] = useState<Record<string, string>>({});

  const applyMut = useMutation({
    mutationFn: (branchId: string) =>
      applyToBranch(branchId, applyMessage[branchId]),
    onSuccess: invalidate,
  });

  const respondMut = useMutation({
    mutationFn: (input: { id: string; accept: boolean }) =>
      respondInvitation(input.id, input.accept),
    onSuccess: invalidate,
  });

  const withdrawMut = useMutation({
    mutationFn: (id: string) => withdrawApplication(id),
    onSuccess: invalidate,
  });

  const leaveMut = useMutation({
    mutationFn: (linkId: string) => leaveLink(linkId),
    onSuccess: invalidate,
  });

  const actionError =
    applyMut.error ?? respondMut.error ?? withdrawMut.error ?? leaveMut.error;

  if (!ready) {
    return <div className="p-4 text-center text-slate-400">Cargando...</div>;
  }

  const invitations = (requests ?? []).filter(
    (r) => r.direction === "invitation" && r.status === "pending",
  );
  const history = (requests ?? []).filter(
    (r) => !(r.direction === "invitation" && r.status === "pending"),
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <DeliveryNav />

        <Title as="h1" size="md" colVariant="on" font="semi">
          Trabajo
        </Title>
        <Text size="sm" className="mt-1 text-slate-500">
          Con la misma cuenta puedes repartir para varios comercios.
        </Text>

        {actionError ? (
          <Text size="sm" colVariant="danger" className="mt-3">
            {(actionError as Error).message}
          </Text>
        ) : null}

        {/* Invitaciones arriba: es lo único de aquí que espera una respuesta. */}
        {invitations.length > 0 ? (
          <Section title="Te invitaron">
            {invitations.map((invite) => (
              <div
                key={invite.id}
                className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4"
              >
                <Text size="sm" font="semi" className="text-slate-100">
                  {invite.comercioName ?? "Un comercio"}
                  {invite.branchName ? (
                    <span className="text-slate-300"> · {invite.branchName}</span>
                  ) : null}
                </Text>
                <Text size="xs" className="text-slate-300">
                  {invite.branchCity ?? ""} ·{" "}
                  {payText(invite.offeredPayPerDelivery, invite.offeredPayPerPriority)}
                </Text>
                {invite.message ? (
                  <Text size="xs" className="mt-1 text-slate-300">
                    “{invite.message}”
                  </Text>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    rounded="md"
                    colVariant="success"
                    disabled={respondMut.isLoading}
                    onClick={() => respondMut.mutate({ id: invite.id, accept: true })}
                  >
                    Aceptar
                  </Button>
                  <Button
                    size="sm"
                    rounded="md"
                    colVariant="default"
                    disabled={respondMut.isLoading}
                    onClick={() => respondMut.mutate({ id: invite.id, accept: false })}
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </Section>
        ) : null}

        <Section title="Dónde trabajas">
          {links === undefined ? (
            <Text size="sm" className="text-slate-400">
              Cargando...
            </Text>
          ) : links.length === 0 ? (
            <Text size="sm" className="text-slate-400">
              Todavía no trabajas para ningún comercio.
            </Text>
          ) : (
            links.map((link) => (
              <div
                key={link.linkId}
                className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="min-w-0">
                  <Text size="sm" font="semi" className="text-slate-100">
                    {link.comercioName ?? "Comercio"}
                    {link.branchName ? (
                      <span className="text-slate-400"> · {link.branchName}</span>
                    ) : null}
                  </Text>
                  {link.branchAddress ? (
                    <Text size="xs" className="text-slate-400">
                      {link.branchAddress}
                    </Text>
                  ) : null}
                  <Text size="xs" className="text-slate-300">
                    {payText(link.payPerDelivery ?? null, link.payPerPriority ?? null)}
                  </Text>
                </div>
                <button
                  type="button"
                  disabled={leaveMut.isLoading}
                  onClick={() => {
                    if (
                      window.confirm(
                        `¿Dejar de trabajar en ${link.branchName ?? "esta sucursal"}? El comercio recibirá un aviso.`,
                      )
                    ) {
                      leaveMut.mutate(link.linkId);
                    }
                  }}
                  className="shrink-0 text-xs font-semibold text-rose-300 hover:text-rose-200 disabled:opacity-50"
                >
                  Dejar
                </button>
              </div>
            ))
          )}
        </Section>

        <Section title="Tu perfil en la bolsa">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <Text size="xs" className="text-slate-400">
              Si prendes la bolsa, los comercios de tu zona (hasta 40 km) ven tu
              nombre corto, tu vehículo, cuántas entregas llevas y lo que
              escribas aquí. Tu teléfono, tu correo y tu documento solo los ve
              el comercio con el que empieces a trabajar.
            </Text>

            {!profile?.onboardingCompleted ? (
              <Text size="xs" className="mt-2 text-amber-300">
                Para aparecer en la bolsa primero identifícate con tu foto y tu
                documento.{" "}
                <Link href="/delivery/onboarding" className="underline">
                  Hacerlo ahora
                </Link>
              </Text>
            ) : null}

            <label className="mt-3 block text-xs text-slate-400">
              Ciudad donde quieres trabajar
              <select
                value={form.workCity}
                onChange={(e) => setForm({ ...form, workCity: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-sm text-slate-100"
              >
                <option value="">Elige tu ciudad</option>
                {cityOptions.map((city) => (
                  <option key={city.value} value={city.label}>
                    {city.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 block text-xs text-slate-400">
              Cuándo puedes trabajar
              <input
                value={form.availabilityNote}
                maxLength={160}
                placeholder="Ej.: lunes a sábado de 5 a 11 pm"
                onChange={(e) =>
                  setForm({ ...form, availabilityNote: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-sm text-slate-100"
              />
            </label>

            <label className="mt-3 block text-xs text-slate-400">
              Preséntate en pocas palabras
              <textarea
                value={form.workBio}
                maxLength={300}
                rows={3}
                placeholder="Ej.: tengo moto propia, conozco bien Envigado y Sabaneta"
                onChange={(e) => setForm({ ...form, workBio: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-sm text-slate-100"
              />
            </label>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                rounded="md"
                colVariant="primary"
                disabled={profileMut.isLoading}
                onClick={() => saveProfile()}
              >
                Guardar
              </Button>
              {profile?.openToWork ? (
                <Button
                  size="sm"
                  rounded="md"
                  colVariant="default"
                  disabled={profileMut.isLoading}
                  onClick={() => saveProfile(false)}
                >
                  Salir de la bolsa
                </Button>
              ) : (
                <Button
                  size="sm"
                  rounded="md"
                  colVariant="success"
                  disabled={profileMut.isLoading || !profile?.onboardingCompleted}
                  onClick={() => saveProfile(true)}
                >
                  Aparecer en la bolsa
                </Button>
              )}
              <Text size="xs" className={profile?.openToWork ? "text-emerald-300" : "text-slate-500"}>
                {profile?.openToWork ? "Estás en la bolsa" : "No apareces en la bolsa"}
              </Text>
            </div>
            {profileMut.error ? (
              <Text size="xs" colVariant="danger" className="mt-2">
                {(profileMut.error as Error).message}
              </Text>
            ) : null}
          </div>
        </Section>

        <Section title="Comercios que contratan cerca">
          {!hasCity ? (
            <Text size="sm" className="text-slate-400">
              Elige tu ciudad arriba y guarda para ver los comercios cercanos.
            </Text>
          ) : branchesQuery.isLoading ? (
            <Text size="sm" className="text-slate-400">
              Buscando...
            </Text>
          ) : branchesQuery.error ? (
            <Text size="sm" colVariant="danger">
              {(branchesQuery.error as Error).message}
            </Text>
          ) : (branchesQuery.data ?? []).length === 0 ? (
            <Text size="sm" className="text-slate-400">
              Por ahora ningún comercio cerca de {profile?.workCity} está
              buscando repartidores. Si prendes la bolsa, ellos también te
              pueden encontrar.
            </Text>
          ) : (
            (branchesQuery.data ?? []).map((branch) => (
              <div
                key={branch.branchId}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Text size="sm" font="semi" className="text-slate-100">
                      {branch.comercioName ?? "Comercio"}
                      <span className="text-slate-400"> · {branch.branchName}</span>
                    </Text>
                    <Text size="xs" className="text-slate-400">
                      {branch.city}
                      {branch.neighborhood ? `, ${branch.neighborhood}` : ""} · a{" "}
                      {branch.distanceKm.toLocaleString("es-CO")} km
                    </Text>
                    {branch.hiringNote ? (
                      <Text size="xs" className="mt-1 text-slate-300">
                        {branch.hiringNote}
                      </Text>
                    ) : null}
                  </div>
                  {branch.lastRequest ? (
                    <span className="shrink-0 text-xs text-slate-400">
                      {JOB_STATUS_LABELS[branch.lastRequest.status]}
                    </span>
                  ) : null}
                </div>

                {branch.canApply ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input
                      value={applyMessage[branch.branchId] ?? ""}
                      maxLength={300}
                      placeholder="Mensaje (opcional)"
                      onChange={(e) =>
                        setApplyMessage({
                          ...applyMessage,
                          [branch.branchId]: e.target.value,
                        })
                      }
                      className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-sm text-slate-100"
                    />
                    <Button
                      size="sm"
                      rounded="md"
                      colVariant="success"
                      disabled={applyMut.isLoading || !profile?.onboardingCompleted}
                      onClick={() => applyMut.mutate(branch.branchId)}
                    >
                      Postularme
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </Section>

        {history.length > 0 ? (
          <Section title="Tus postulaciones e invitaciones">
            {history.map((request) => (
              <div
                key={request.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3"
              >
                <div className="min-w-0">
                  <Text size="sm" className="text-slate-200">
                    {request.comercioName ?? "Comercio"}
                    {request.branchName ? ` · ${request.branchName}` : ""}
                  </Text>
                  <Text size="xs" className="text-slate-500">
                    {request.direction === "application"
                      ? "Te postulaste"
                      : "Te invitaron"}{" "}
                    el {new Date(request.createdAt).toLocaleDateString("es-CO")} ·{" "}
                    {JOB_STATUS_LABELS[request.status]}
                  </Text>
                </div>
                {request.direction === "application" &&
                request.status === "pending" ? (
                  <button
                    type="button"
                    disabled={withdrawMut.isLoading}
                    onClick={() => withdrawMut.mutate(request.id)}
                    className="shrink-0 text-xs font-semibold text-slate-300 hover:text-slate-100 disabled:opacity-50"
                  >
                    Retirar
                  </button>
                ) : null}
              </div>
            ))}
          </Section>
        ) : null}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">
      <Text size="sm" font="semi" className="text-slate-200">
        {title}
      </Text>
      <div className="mt-2 grid gap-2">{children}</div>
    </section>
  );
}
