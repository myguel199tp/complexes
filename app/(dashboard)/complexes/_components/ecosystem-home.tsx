"use client";

/**
 * El mapa del ecosistema en la portada.
 *
 * Es la pieza que responde de una a "¿esto qué es?": se ve que residentes,
 * administración, portería, comercios y propietarios cuelgan del mismo punto.
 * Abre la portada —antes del héroe— porque es el argumento, no un detalle
 * que se descubra al final del scroll.
 *
 * Reutiliza el mismo `EcosystemMap` de /soluciones/ecosistemas: aquí sólo se
 * le pone el marco oscuro para que se lea igual sobre el fondo de la portada,
 * y un enlace para quien quiera el recorrido completo.
 *
 * El actor que se elige aquí reescribe toda la portada, así que el proveedor
 * de la perspectiva lo pone `hompage.tsx` y no esta sección. El pie le ofrece
 * al visitante su propio siguiente paso (la demo, la entrada de comercios…).
 */

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Text, Title } from "complexes-next-components";
import { route } from "@/app/_domain/constants/routes";
import EcosystemMap from "../../soluciones/ecosistemas/_components/ecosystem-map";
import { useEcosystemPerspective } from "../../soluciones/ecosistemas/_components/ecosystem-perspective";
import Reveal from "./Reveal";

export default function EcosystemHome() {
  const { actor } = useEcosystemPerspective();
  const router = useRouter();

  return (
    <Reveal>
      <section
        className="relative px-2 py-6 sm:px-3 sm:py-8 md:px-4 xl:px-6"
        aria-labelledby="ecosystem-home-title"
      >
        <div className="relative mx-auto w-full max-w-[1400px] overflow-hidden rounded-[20px] border border-white/10 bg-[#0B1120] px-4 py-8 text-white shadow-[0_25px_80px_rgba(0,0,0,.35)] sm:rounded-[24px] sm:px-6 sm:py-12 md:rounded-[32px] md:px-10 md:py-16">
          {/* Luces de fondo: el mismo lenguaje del resto de la portada. */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-32 right-[-120px] h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[120px]" />

          <div className="relative z-10">
            <div className="mb-6 flex items-center justify-between gap-8 sm:mb-10">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] sm:px-4 sm:text-xs font-medium uppercase tracking-wider text-cyan-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                  Modelo de ecosistema
                </span>

                <Title
                  id="ecosystem-home-title"
                  as="h2"
                  size="sm"
                  font="bold"
                  className="mt-4 text-2xl leading-tight text-white sm:mt-5 sm:text-3xl md:text-4xl"
                >
                  Conjuntos, residentes y comercios: un solo ecosistema.
                </Title>

                <div className="mt-4 sm:mt-5">
                  <Button
                    colVariant="success"
                    onClick={() => router.push(route.demost)}
                    rounded="lg"
                  >
                    Solicitar demostración
                  </Button>
                </div>

                <Text className="mt-3 text-sm text-slate-400 sm:mt-4 sm:text-base">
                  Administración, residentes, portería, propietarios y los
                  negocios del barrio conectados en la misma plataforma. Elige
                  quién eres y toda la página se reescribe para mostrarte lo que
                  te toca.
                </Text>
              </div>

              {/* El logo tiene letras azul oscuro: sobre el fondo del mapa se
                perdería, así que va sobre una tarjeta clara. */}
              <div className="hidden shrink-0 rounded-3xl border border-white/10 px-8 py-6 shadow-[0_0_60px_rgba(34,211,238,.25)] lg:block">
                <Image
                  src="/nameImage.png"
                  alt="globaliaph"
                  width={470}
                  height={313}
                  sizes="260px"
                  className="h-auto w-[220px] select-none xl:w-[260px]"
                />
              </div>
            </div>

            <EcosystemMap />

            <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
              {actor && (
                <Link
                  href={actor.cta.href}
                  className={`inline-flex w-full items-center justify-center gap-2 text-center sm:w-fit sm:justify-start rounded-full border bg-white/5 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10 ${actor.accent.ring} ${actor.accent.text}`}
                >
                  <actor.icon />
                  {actor.cta.texto} →
                </Link>
              )}

              <Link
                href={route.ecosistemas}
                className="text-sm font-semibold text-cyan-300 underline underline-offset-4 transition-colors hover:text-cyan-200"
              >
                Ver cómo circula el valor entre ellos →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
