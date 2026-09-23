"use client";

/**
 * Landing del modelo de ecosistema.
 *
 * El orden responde a la objeción real del visitante: "¿esto es otro software
 * de administración?". Primero se muestra quiénes están conectados (el mapa),
 * después por dónde circula el valor entre ellos (los circuitos) y al final
 * por qué el valor crece con cada conjunto que entra (el efecto red). Solo
 * entonces se pide la demo.
 *
 * Al elegir un actor en el mapa la página entera se lee desde su punto de
 * vista: los circuitos que lo tocan suben y el resto se atenúa (no se oculta,
 * para que la página no salte de alto ni se pierda el contexto), sus pasos se
 * pintan de su color y el cierre le ofrece su propio siguiente paso.
 */

import { route } from "@/app/_domain/constants/routes";
import { Button, Text, Title } from "complexes-next-components";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import { CIRCUITOS, ETAPAS } from "./ecosystem-data";
import EcosystemMap from "./ecosystem-map";
import {
  EcosystemPerspectiveProvider,
  esRelevante,
  useEcosystemPerspective,
} from "./ecosystem-perspective";

/** Lo que no le habla al actor elegido: se ve, pero en segundo plano. */
const ATENUADO = "opacity-40 saturate-50 hover:opacity-80";

export default function EcosystemLanding() {
  return (
    <EcosystemPerspectiveProvider>
      <EcosystemLandingContent />
    </EcosystemPerspectiveProvider>
  );
}

function EcosystemLandingContent() {
  const router = useRouter();
  const { activo, actor, setActivo } = useEcosystemPerspective();

  // Orden estable: los circuitos del actor primero, en su orden original.
  const circuitos = useMemo(
    () =>
      [...CIRCUITOS].sort(
        (a, b) =>
          Number(esRelevante(activo, b.actores)) -
          Number(esRelevante(activo, a.actores)),
      ),
    [activo],
  );
  const circuitosDelActor = CIRCUITOS.filter((circuito) =>
    esRelevante(activo, circuito.actores),
  ).length;

  return (
    <main className="relative overflow-hidden bg-slate-950 text-white">
      {/* Luces de fondo: el mismo lenguaje de las demás landings de soluciones. */}
      <div className="pointer-events-none absolute left-[-140px] top-[-140px] h-[440px] w-[440px] rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="pointer-events-none absolute right-[-160px] top-[35%] h-[520px] w-[520px] rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-160px] left-[15%] h-[400px] w-[400px] rounded-full bg-fuchsia-500/15 blur-3xl" />

      {/* HERO */}
      <section className="relative mx-auto max-w-5xl px-6 pb-16 pt-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-cyan-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          Modelo de ecosistema
        </span>

        <Title
          as="h1"
          size="md"
          font="bold"
          className="mt-6 leading-tight text-white"
        >
          Un conjunto no es un cliente.
          <br />
          Es un cruce de caminos.
        </Title>

        <Text className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
          Residentes, administración, portería, comercios y propietarios ya
          hacían negocios entre ellos: por WhatsApp, por Excel y con papelitos
          en portería. globaliaph no inventa esas relaciones, las pone en un
          mismo sitio —y ahí aparece el valor que ninguno podía darse solo.
        </Text>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            colVariant="success"
            rounded="lg"
            onClick={() => router.push(route.demost)}
          >
            Solicitar demostración
          </Button>

          <Link
            href={route.platform}
            className="text-sm font-semibold text-cyan-300 underline underline-offset-4 transition-colors hover:text-cyan-200"
          >
            Ver los módulos uno por uno →
          </Link>
        </div>
      </section>

      {/* MAPA DEL ECOSISTEMA */}
      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 max-w-2xl">
          <Title as="h2" size="sm" font="semi" className="text-white">
            Quiénes están conectados
          </Title>
          <Text className="mt-3 text-slate-400">
            Cinco actores alrededor de la misma plataforma. Elige uno y el resto
            de la página se ordena para mostrarte lo que le toca.
          </Text>
        </div>

        <EcosystemMap />
      </section>

      {/* CIRCUITOS */}
      <section className="relative border-t border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <Title as="h2" size="sm" font="semi" className="text-white">
              Por dónde circula el valor
            </Title>
            <Text className="mt-3 text-slate-400">
              Cuatro recorridos que atraviesan a varios actores a la vez.
              Ninguno se puede completar si falta uno: esa es la diferencia
              entre un ecosistema y una lista de funcionalidades.
            </Text>

            {actor && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border bg-white/5 px-3 py-1 text-xs font-medium ${actor.accent.ring} ${actor.accent.text}`}
                >
                  <actor.icon />
                  {circuitosDelActor} de {CIRCUITOS.length} pasan por{" "}
                  {actor.nombre.toLowerCase()}
                </span>
                <button
                  type="button"
                  onClick={() => setActivo(null)}
                  className="text-xs font-semibold text-slate-400 underline underline-offset-4 transition-colors hover:text-white"
                >
                  Ver todo
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {circuitos.map((circuito) => {
              const Icono = circuito.icon;
              const relevante = esRelevante(activo, circuito.actores);
              return (
                <article
                  key={circuito.id}
                  className={`group rounded-3xl border bg-white/5 p-8 backdrop-blur-xl transition-all duration-500 ${
                    actor && relevante
                      ? `${actor.accent.ring} ${actor.accent.glow}`
                      : "border-white/10 hover:border-cyan-400/40"
                  } ${relevante ? "" : ATENUADO}`}
                >
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900/60 text-cyan-300">
                      <Icono />
                    </span>
                    <Title as="h3" size="sm" font="semi" className="text-white">
                      {circuito.titulo}
                    </Title>
                  </div>

                  {/* El recorrido como cadena: cada paso hereda del anterior.
                      Los pasos del actor elegido se pintan de su color. */}
                  <ol className="relative space-y-4 border-l border-dashed border-white/15 pl-6">
                    {circuito.pasos.map((paso) => {
                      const propio =
                        actor !== null && paso.actores.includes(actor.id);
                      return (
                        <li key={paso.texto} className="relative">
                          <span
                            className={`absolute top-2 rounded-full transition-all ${
                              propio
                                ? `-left-[28.5px] h-3 w-3 ${actor.accent.dot}`
                                : "-left-[27px] h-2 w-2 bg-cyan-400/70"
                            }`}
                          />
                          <Text
                            size="sm"
                            className={
                              propio
                                ? `font-semibold ${actor.accent.text}`
                                : "text-slate-200"
                            }
                          >
                            {paso.texto}
                          </Text>
                        </li>
                      );
                    })}
                  </ol>

                  <Text
                    size="sm"
                    className="mt-6 border-t border-white/10 pt-5 leading-relaxed text-slate-400"
                  >
                    {circuito.cierre}
                  </Text>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* EFECTO RED */}
      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <Title as="h2" size="sm" font="semi" className="text-white">
            Por qué crece solo
          </Title>
          <Text className="mt-3 text-slate-400">
            Un software se compra y se queda igual. Un ecosistema vale más cada
            vez que entra alguien nuevo.
          </Text>
        </div>

        {/* Las etapas son una secuencia numerada: no se reordenan, solo se
            atenúan las que no protagoniza el actor elegido. */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {ETAPAS.map((etapa) => {
            const relevante = esRelevante(activo, etapa.actores);
            return (
              <article
                key={etapa.numero}
                className={`relative overflow-hidden rounded-3xl border bg-gradient-to-b from-white/[0.07] to-transparent p-7 transition-all duration-500 ${
                  actor && relevante ? actor.accent.ring : "border-white/10"
                } ${relevante ? "" : ATENUADO}`}
              >
                <span className="block text-4xl font-bold text-white/10">
                  {etapa.numero}
                </span>
                <Title
                  as="h3"
                  size="sm"
                  font="semi"
                  className={`mt-2 ${actor && relevante ? actor.accent.text : "text-cyan-300"}`}
                >
                  {etapa.titulo}
                </Title>
                <Text size="sm" className="mt-3 leading-relaxed text-slate-300">
                  {etapa.texto}
                </Text>
              </article>
            );
          })}
        </div>
      </section>

      {/* CIERRE */}
      <section className="relative border-t border-white/10 bg-white/[0.03] px-6 py-20 text-center backdrop-blur-xl">
        <div className="mx-auto max-w-3xl">
          <Title as="h2" size="sm" font="semi" className="text-white">
            El conjunto ya era un ecosistema. Solo le faltaba el sitio donde
            encontrarse.
          </Title>
          <Text className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            Te mostramos el recorrido completo con datos parecidos a los de tu
            conjunto, en unos 30 minutos.
          </Text>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              colVariant="success"
              rounded="lg"
              onClick={() => router.push(actor?.cta.href ?? route.demost)}
            >
              {actor?.cta.texto ?? "Agendar la demostración"}
            </Button>

            {/* El enlace secundario es la otra puerta: al comercio se le
                ofrece la demo; a los demás, la entrada de comercios. */}
            {actor?.id === "comercios" ? (
              <Link
                href={route.demost}
                className="text-sm font-semibold text-cyan-300 underline underline-offset-4 transition-colors hover:text-cyan-200"
              >
                Soy administrador y quiero la demo →
              </Link>
            ) : (
              <Link
                href={route.comercios}
                className="text-sm font-semibold text-cyan-300 underline underline-offset-4 transition-colors hover:text-cyan-200"
              >
                Tengo un comercio y quiero entrar →
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
