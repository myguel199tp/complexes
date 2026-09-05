"use client";

import React from "react";
import Image from "next/image";
import { Text, Title } from "complexes-next-components";
import Reveal from "./Reveal";

/**
 * Prueba social de la portada.
 *
 * Deliberadamente vacío: una cifra o un testimonio inventado es peor que no
 * tener ninguno, porque el primer cliente que pregunte "¿cuáles conjuntos?"
 * deja de creer el resto de la página. Cuando existan datos reales se llenan
 * los arreglos de abajo y la sección aparece sola; mientras estén vacíos no se
 * renderiza nada.
 */

interface Stat {
  /** Cifra ya formateada, tal como se quiere mostrar. Ej. "38". */
  value: string;
  label: string;
}

interface Testimonial {
  quote: string;
  /** Nombre y cargo de quien lo dijo. Sin autorización, no se publica. */
  author: string;
  role: string;
}

interface ClientLogo {
  name: string;
  /** Ruta dentro de /public. Ej. "/clientes/altos-del-parque.png". */
  logo: string;
}

const stats: Stat[] = [];

const testimonials: Testimonial[] = [];

const clientLogos: ClientLogo[] = [];

export default function SocialProof() {
  const hasContent =
    stats.length > 0 || testimonials.length > 0 || clientLogos.length > 0;

  if (!hasContent) return null;

  return (
    <Reveal>
      <section
        className="relative overflow-hidden px-4 py-14 md:px-8"
        aria-labelledby="social-proof-title"
      >
        <div className="relative z-10 mx-auto max-w-7xl">
          <Title
            id="social-proof-title"
            as="h2"
            size="sm"
            font="bold"
            className="text-center text-3xl md:text-4xl"
          >
            Conjuntos que ya administran con globaliaph
          </Title>

          {stats.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[28px] border border-black/5 bg-white/60 p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,.08)] backdrop-blur-xl"
                >
                  <Title as="h3" size="sm" font="bold" className="text-4xl">
                    {stat.value}
                  </Title>

                  <Text size="sm" className="mt-2 text-gray-500">
                    {stat.label}
                  </Text>
                </div>
              ))}
            </div>
          )}

          {clientLogos.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 opacity-80">
              {clientLogos.map((client) => (
                <Image
                  key={client.name}
                  src={client.logo}
                  alt={client.name}
                  width={140}
                  height={48}
                  className="h-12 w-auto object-contain grayscale transition-all hover:grayscale-0"
                />
              ))}
            </div>
          )}

          {testimonials.length > 0 && (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial.author}
                  className="rounded-[28px] border border-black/5 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,.08)] backdrop-blur-xl"
                >
                  <blockquote>
                    <Text size="sm" className="leading-relaxed">
                      “{testimonial.quote}”
                    </Text>
                  </blockquote>

                  <figcaption className="mt-4">
                    <Text size="sm" font="semi">
                      {testimonial.author}
                    </Text>

                    <Text size="xs" className="text-gray-500">
                      {testimonial.role}
                    </Text>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </Reveal>
  );
}
