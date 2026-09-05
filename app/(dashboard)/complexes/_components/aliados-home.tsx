/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Text, Title } from "complexes-next-components";
import { FaBuilding, FaStore } from "react-icons/fa";
import { route } from "@/app/_domain/constants/routes";
import { useAliados } from "@/app/components/aliados/use-aliados";
import { resolveAliadoLogo } from "@/app/components/aliados/aliados-service";
import Reveal from "./Reveal";

const MAX_LOGOS = 8;

/**
 * Bloque de la home dedicado al ecosistema comercial.
 *
 * Es el único punto de la portada que le habla al comercio, así que está
 * escrito en segunda persona hacia él —"tu negocio", no "tu conjunto"— y las
 * viñetas dicen qué gana el comercio, no qué gana la administración: eso ya lo
 * cuentan las otras nueve secciones. El gancho de registro se muestra siempre;
 * antes dependía de que no hubiera aliados publicados, de modo que la
 * invitación se apagaba justo cuando la red empezaba a funcionar.
 */
export default function AliadosHome() {
  const { aliados, isLoading } = useAliados();

  const visibles = aliados.slice(0, MAX_LOGOS);
  const restantes = aliados.length - visibles.length;

  return (
    <Reveal>
      <section
        className="relative overflow-hidden px-4 py-10 md:px-8"
        aria-labelledby="aliados-title"
      >
        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          {/* ENCABEZADO */}
          <div className="max-w-3xl">
            <Reveal delay={0.1}>
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-400" />
                <span className="text-sm font-medium">
                  ¿Tienes un negocio? Esta parte es para ti
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <Title
                id="aliados-title"
                as="h2"
                size="sm"
                font="bold"
                className="text-4xl leading-[1.05] tracking-[-0.03em] md:text-5xl"
              >
                Véndele a los conjuntos que ya usan globaliaph
              </Title>
            </Reveal>

            <Reveal delay={0.3}>
              <Text size="md" className="mt-6 leading-relaxed">
                Cada conjunto de la plataforma es un cliente con presupuesto y
                cientos de hogares detrás. Registras tu negocio gratis, eliges si
                le vendes a la administración, a los residentes o a ambos, y
                entras sin intermediario: el pago lo cobras tú.
              </Text>
            </Reveal>
          </div>

          {/* DOS MODELOS */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.4} direction="left">
              <ModelCard
                icon={<FaBuilding />}
                tag="B2B"
                title="Véndele a la administración"
                bullets={[
                  "Publicas tus planes de aseo, seguridad, mantenimiento u obra con precio y periodicidad",
                  "Recibes solicitudes de conjuntos que ya buscan tu categoría, sin licitar a ciegas",
                  "Contratos, agenda y facturación dentro de la plataforma, con tu cartera al día",
                  "Cada servicio cumplido suma calificaciones que te hacen visible ante los demás conjuntos",
                ]}
                href={route.comercios}
                cta="Ver cómo funciona el B2B"
              />
            </Reveal>

            <Reveal delay={0.5} direction="right">
              <ModelCard
                icon={<FaStore />}
                tag="B2C"
                title="Véndele a los residentes"
                bullets={[
                  "Publicas sucursales, catálogo, precios y descuentos para los hogares de cada conjunto",
                  "Tu repartidor entra con QR: se acabó la llamada a portería y la espera en la reja",
                  "Cobras contraentrega en efectivo, con datáfono o por transferencia a tu cuenta",
                  "Sin comisión por venta: el pedido es tuyo y el dinero llega directo a tu negocio",
                ]}
                href={route.comercios}
                cta="Ver cómo funciona el B2C"
              />
            </Reveal>
          </div>

          {/* CTA DE REGISTRO + PRUEBA */}
          <Reveal delay={0.6}>
            <div className="mt-8 rounded-[32px] border border-black/5 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,.08)] backdrop-blur-xl md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <Text font="semi" size="sm">
                    Registrar tu negocio no cuesta nada
                  </Text>
                  <Text size="xs" className="mt-1 text-gray-500">
                    Creas la cuenta, eliges tu modelo y publicas. Sin
                    permanencia y sin comisión sobre lo que vendas.
                  </Text>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <Link
                    href="/comercio/register"
                    className="rounded-full bg-cyan-700 px-6 py-2.5 text-center text-sm font-bold text-white transition-transform hover:scale-105"
                  >
                    Registrar mi comercio
                  </Link>

                  <Link
                    href={route.comercios}
                    className="rounded-full border border-cyan-700/30 px-6 py-2.5 text-center text-sm font-bold text-cyan-800 transition-colors hover:bg-cyan-50"
                  >
                    Ver más detalles
                  </Link>
                </div>
              </div>

              {isLoading ? (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 animate-pulse rounded-2xl bg-gray-100"
                    />
                  ))}
                </div>
              ) : aliados.length > 0 ? (
                <>
                  <Text size="xs" className="mt-6 font-semibold text-gray-500">
                    Negocios que ya son parte de la red
                  </Text>

                  <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {visibles.map((aliado) => {
                      const logo = resolveAliadoLogo(aliado.logoUrl);
                      return (
                        <div
                          key={aliado.id}
                          title={aliado.businessName}
                          className="flex h-20 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white p-2 transition-transform hover:scale-105"
                        >
                          {logo ? (
                            <img
                              src={logo}
                              alt={aliado.businessName}
                              className="max-h-14 max-w-full object-contain"
                            />
                          ) : (
                            <span className="line-clamp-2 px-1 text-center text-xs font-semibold text-cyan-800">
                              {aliado.businessName}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {restantes > 0 ? (
                    <Text size="xs" className="mt-4 text-center text-gray-500">
                      y {restantes} más en el directorio
                    </Text>
                  ) : null}
                </>
              ) : (
                /* Sin aliados aún: se habla de las categorías abiertas, no de
                   un vacío. */
                <>
                  <Text size="xs" className="mt-6 font-semibold text-gray-500">
                    Categorías abiertas hoy
                  </Text>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      "Mantenimiento y obras",
                      "Aseo y jardinería",
                      "Seguridad y tecnología",
                      "Tiendas, comida y mercado",
                    ].map((categoria) => (
                      <div
                        key={categoria}
                        className="flex items-center gap-3 rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/50 px-4 py-3"
                      >
                        <span className="text-cyan-700">◆</span>
                        <Text size="sm" className="text-gray-600">
                          {categoria}
                        </Text>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </Reveal>
  );
}

function ModelCard({
  icon,
  tag,
  title,
  bullets,
  href,
  cta,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  bullets: string[];
  href: string;
  cta: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-[32px] border border-black/5 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,.06)] backdrop-blur-xl md:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-lg text-cyan-700">
          {icon}
        </span>
        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
          {tag}
        </span>
      </div>

      <Title size="xs" font="bold" className="mt-4">
        {title}
      </Title>

      <ul className="mt-5 flex-1 space-y-3">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-600">✓</span>
            <span className="text-sm leading-relaxed md:text-base">{b}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className="mt-6 inline-block text-sm font-bold text-cyan-800 underline underline-offset-4 hover:text-cyan-600"
      >
        {cta} →
      </Link>
    </div>
  );
}
