"use client";

/**
 * El mapa del ecosistema en la portada.
 *
 * Es la pieza que responde de una a "¿esto qué es?": se ve que residentes,
 * administración, portería, comercios y propietarios cuelgan del mismo punto.
 * Va arriba —justo después del héroe— porque es el argumento, no un detalle
 * que se descubra al final del scroll.
 *
 * Reutiliza el mismo `EcosystemMap` de /soluciones/ecosistemas: aquí sólo se
 * le pone el marco oscuro para que se lea igual sobre el fondo de la portada,
 * y un enlace para quien quiera el recorrido completo.
 */

import Link from "next/link";
import { Text, Title } from "complexes-next-components";
import { route } from "@/app/_domain/constants/routes";
import EcosystemMap from "../../soluciones/ecosistemas/_components/ecosystem-map";
import Reveal from "./Reveal";

export default function EcosystemHome() {
  return (
    <Reveal>
      <section
        className="relative px-2 py-8 sm:px-3 md:px-4 xl:px-6"
        aria-labelledby="ecosystem-home-title"
      >
        <div className="relative mx-auto w-full max-w-[1400px] overflow-hidden rounded-[24px] border border-white/10 bg-[#0B1120] px-6 py-14 text-white shadow-[0_25px_80px_rgba(0,0,0,.35)] md:rounded-[32px] md:px-10 md:py-16">
          {/* Luces de fondo: el mismo lenguaje del resto de la portada. */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-32 right-[-120px] h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[120px]" />

          <div className="relative z-10">
            <div className="mb-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-cyan-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                Modelo de ecosistema
              </span>

              <Title
                id="ecosystem-home-title"
                as="h2"
                size="sm"
                font="bold"
                className="mt-5 text-3xl leading-tight text-white md:text-4xl"
              >
                Un conjunto no es un cliente. Es un cruce de caminos.
              </Title>

              <Text className="mt-4 text-slate-400">
                Cinco actores alrededor de la misma plataforma. Elige uno para
                ver qué pone en el ecosistema y qué se lleva por estar dentro.
              </Text>
            </div>

            <EcosystemMap />

            <div className="mt-10 border-t border-white/10 pt-6">
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
