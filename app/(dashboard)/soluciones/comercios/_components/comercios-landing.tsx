"use client";

import { useState } from "react";
import Link from "next/link";
import { Text, Title } from "complexes-next-components";
import {
  FaBuilding,
  FaChevronDown,
  FaStore,
  FaWhatsapp,
} from "react-icons/fa";
import { route } from "@/app/_domain/constants/routes";
import Reveal from "../../../complexes/_components/Reveal";
import FooterComplex from "../../../complexes/_components/footerComplex";

/**
 * Landing de captación de comercios.
 *
 * La portada es del conjunto y así debe seguir: allí el comercio solo recibe
 * un gancho. Esta página es donde se le responde lo único que le importa antes
 * de registrarse —a quién le vendo, cómo entro, cómo cobro y qué me cuesta—,
 * y por eso todo lo que se promete aquí corresponde a módulos que ya existen
 * en `app/comercio`: planes y contratos B2B, catálogo y pedidos B2C, QR de
 * ingreso para el repartidor y cuenta bancaria verificada.
 */

const REGISTER_HREF = "/comercio/register";

const WHATSAPP_URL =
  "https://wa.me/573003066369?text=Hola,%20tengo%20un%20negocio%20y%20quiero%20venderle%20a%20los%20conjuntos";

/** Lo que hoy le cuesta a un negocio venderle a una copropiedad. */
const FRICCIONES = [
  {
    titulo: "No sabes con quién hablar",
    texto:
      "El administrador cambia, el consejo decide por votación y no hay una puerta clara para ofrecer un servicio. Terminas dejando la cotización en portería.",
  },
  {
    titulo: "El domiciliario se queda en la reja",
    texto:
      "Cada entrega depende de que el vigilante llame al apartamento. El pedido se enfría, el cliente se molesta y la culpa es tuya.",
  },
  {
    titulo: "Las apps se quedan con tu margen",
    texto:
      "Los marketplaces de domicilio cobran comisión sobre cada venta y son ellos, no tú, los dueños de la relación con el cliente.",
  },
];

/** Qué recibe cada modelo. Cada viñeta corresponde a un módulo existente. */
const MODELOS = [
  {
    tag: "B2B",
    icon: FaBuilding,
    titulo: "Le vendes a la administración",
    para: "Aseo, jardinería, seguridad, tecnología, mantenimiento, obras y todo servicio recurrente que hoy contrata una copropiedad.",
    incluye: [
      "Publicas tus planes de servicio con precio y periodicidad, visibles para los conjuntos de la red",
      "Recibes solicitudes y cotizaciones de conjuntos que ya buscan tu categoría",
      "Agenda de visitas y órdenes de trabajo, para no cruzar dos conjuntos el mismo día",
      "Contratos firmados dentro de la plataforma, con su vigencia y sus renovaciones",
      "Facturación y cartera: ves qué está por cobrar, qué está vencido y qué ya te pagaron",
      "Carpeta de cumplimiento con tus pólizas y certificados al día ante cada cliente",
      "Calificaciones de los conjuntos que ya atendiste, que te hacen visible ante los siguientes",
    ],
  },
  {
    tag: "B2C",
    icon: FaStore,
    titulo: "Le vendes a los residentes",
    para: "Restaurantes, mercados, panaderías, droguerías, tiendas y cualquier negocio que quiera atender los hogares de un conjunto.",
    incluye: [
      "Publicas tus sucursales y defines a qué conjuntos llega cada una",
      "Catálogo con fotos, precios y disponibilidad, administrado por ti",
      "Descuentos y promociones dirigidos a los residentes de un conjunto concreto",
      "Pedidos con estado en vivo, desde que entran hasta que se entregan",
      "Tus propios repartidores, invitados por correo, con placa y tipo de vehículo",
      "El repartidor entra con QR: portería no tiene que llamar y la visita queda en la minuta",
      "Cobras contraentrega en efectivo, con datáfono o por transferencia a tu cuenta verificada",
    ],
  },
];

const PASOS = [
  {
    paso: "01",
    titulo: "Registras tu negocio",
    texto:
      "NIT, datos de contacto, ciudad y el modelo con el que vas a operar. No pedimos tarjeta y no hay plan que elegir para empezar.",
  },
  {
    paso: "02",
    titulo: "Publicas lo que vendes",
    texto:
      "Tus planes de servicio si eres B2B, o tus sucursales y tu catálogo si eres B2C. Desde ese momento apareces ante los conjuntos.",
  },
  {
    paso: "03",
    titulo: "Recibes y cobras",
    texto:
      "Te llegan solicitudes o pedidos, los atiendes con tu propio equipo y el dinero entra a tu cuenta. Nosotros no nos metemos en medio del pago.",
  },
];

const FAQS = [
  {
    q: "¿Cuánto cuesta registrar mi negocio?",
    a: "Nada. Crear la cuenta, publicar tu catálogo o tus sucursales y recibir pedidos de residentes no tiene costo. Si operas como B2B y quieres vender planes de servicio recurrente a las copropiedades, se activa un plan de acceso con el detalle de precios dentro de tu panel.",
  },
  {
    q: "¿Me cobran comisión por cada venta?",
    a: "No. El pedido es tuyo y el pago lo cobras tú: contraentrega en efectivo, con datáfono o por transferencia a la cuenta bancaria que registres. La plataforma no se interpone en el cobro ni descuenta un porcentaje.",
  },
  {
    q: "¿Quién hace la entrega?",
    a: "Tú, con tus propios repartidores. Los das de alta en la plataforma con su vehículo y su placa, y cada uno recibe el código QR que le abre la entrada del conjunto. No dependes de una flota de terceros ni pagas por domicilio.",
  },
  {
    q: "¿Cómo entra mi domiciliario al conjunto?",
    a: "Con el QR asociado al pedido. Lo presenta en portería, el ingreso queda registrado solo en la minuta del conjunto y no hace falta que el vigilante llame al apartamento. Es la misma puerta que usan las visitas de los residentes.",
  },
  {
    q: "¿Qué necesito para registrarme?",
    a: "El NIT o documento del negocio, un responsable de contacto, la dirección y la ciudad donde operas, y un correo con contraseña para entrar a tu panel. Si vas a operar B2B, además te pedimos los documentos de cumplimiento que cada conjunto exige a sus proveedores.",
  },
  {
    q: "¿Puedo vender a la administración y a los residentes a la vez?",
    a: "El modelo se elige al registrarte y define de qué se compone tu cuenta, así que conviene pensarlo antes: B2C se organiza por sucursales y catálogo, y B2B por planes y contratos. Si tu negocio necesita los dos frentes, escríbenos y lo revisamos contigo.",
  },
  {
    q: "¿En qué ciudades funciona?",
    a: "Donde haya conjuntos usando globaliaph. Al registrarte eliges tu ciudad y tus sucursales solo aparecen ante los conjuntos que alcanzas; si todavía no hay copropiedades activas en tu zona, tu cuenta queda publicada para cuando las haya.",
  },
];

export default function ComerciosLanding() {
  return (
    <main className="min-h-screen w-full">
      <HeroComercios />
      <FriccionSection />
      <ModelosSection />
      <PasosSection />
      <CostoSection />
      <FaqComercios />
      <CierreComercios />

      <Reveal>
        <FooterComplex />
      </Reveal>
    </main>
  );
}

function HeroComercios() {
  return (
    <Reveal>
      <section
        className="relative overflow-hidden px-4 py-14 md:px-8 md:py-20"
        aria-labelledby="comercios-hero-title"
      >
        <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <Reveal delay={0.1}>
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-black/5 bg-white/60 px-5 py-3 backdrop-blur-xl">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-500" />
              <span className="text-sm font-medium">
                Para negocios, proveedores y tiendas
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <Title
              id="comercios-hero-title"
              as="h1"
              size="sm"
              font="bold"
              className="text-4xl leading-[1.05] tracking-[-0.03em] md:text-6xl"
            >
              Tu negocio, dentro de los conjuntos
            </Title>
          </Reveal>

          <Reveal delay={0.3}>
            <Text
              size="md"
              className="mx-auto mt-6 max-w-2xl leading-relaxed text-gray-600"
            >
              globaliaph administra conjuntos residenciales completos: la
              copropiedad que contrata servicios y los cientos de hogares que
              hay dentro. Registras tu negocio gratis y le vendes a los dos, sin
              intermediario y sin comisión sobre lo que factures.
            </Text>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={REGISTER_HREF}
                className="flex h-[54px] w-full items-center justify-center rounded-md bg-cyan-700 px-8 text-base font-bold text-white shadow-[0_0_40px_rgba(14,116,144,.35)] transition-transform hover:scale-105 sm:w-auto sm:min-w-[260px]"
              >
                Registrar mi negocio gratis
              </Link>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[54px] w-full items-center justify-center gap-2 rounded-md border border-black/10 px-8 text-base font-semibold transition-all hover:scale-105 hover:bg-black/5 sm:w-auto sm:min-w-[240px]"
              >
                <FaWhatsapp size={18} className="text-green-600" />
                Hablar con un asesor
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.5}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <span>✓ Registro sin costo</span>
              <span>✓ Sin comisión por venta</span>
              <span>✓ Sin permanencia</span>
            </div>
          </Reveal>
        </div>
      </section>
    </Reveal>
  );
}

function FriccionSection() {
  return (
    <Reveal>
      <section
        className="px-4 py-12 md:px-8"
        aria-labelledby="comercios-friccion-title"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <Title
              id="comercios-friccion-title"
              as="h2"
              size="sm"
              font="bold"
              className="text-3xl leading-tight tracking-[-0.02em] md:text-4xl"
            >
              Venderle a un conjunto siempre ha sido complicado
            </Title>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {FRICCIONES.map((item, i) => (
              <Reveal key={item.titulo} delay={0.1 * (i + 1)}>
                <div className="h-full rounded-[28px] border border-black/5 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,.06)] backdrop-blur-xl">
                  <Text font="bold" size="md">
                    {item.titulo}
                  </Text>
                  <Text size="sm" className="mt-3 leading-relaxed text-gray-500">
                    {item.texto}
                  </Text>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function ModelosSection() {
  return (
    <Reveal>
      <section
        className="relative overflow-hidden px-4 py-12 md:px-8"
        aria-labelledby="comercios-modelos-title"
      >
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <Title
              id="comercios-modelos-title"
              as="h2"
              size="sm"
              font="bold"
              className="text-3xl leading-tight tracking-[-0.02em] md:text-4xl"
            >
              Elige a quién le vendes
            </Title>

            <Text size="md" className="mt-5 leading-relaxed text-gray-600">
              Son dos negocios distintos dentro del mismo conjunto. El modelo se
              elige al registrarte y define cómo se organiza tu panel.
            </Text>
          </div>

          <div className="mt-9 grid gap-6 lg:grid-cols-2">
            {MODELOS.map((modelo, i) => {
              const Icon = modelo.icon;
              return (
                <Reveal
                  key={modelo.tag}
                  delay={0.15 * (i + 1)}
                  direction={i === 0 ? "left" : "right"}
                >
                  <div className="flex h-full flex-col rounded-[32px] border border-black/5 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,.06)] backdrop-blur-xl md:p-8">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-lg text-cyan-700">
                        <Icon />
                      </span>
                      <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
                        {modelo.tag}
                      </span>
                    </div>

                    <Title size="xs" font="bold" className="mt-4">
                      {modelo.titulo}
                    </Title>

                    <Text size="sm" className="mt-3 leading-relaxed text-gray-500">
                      {modelo.para}
                    </Text>

                    <ul className="mt-6 flex-1 space-y-3 border-t border-black/5 pt-6">
                      {modelo.incluye.map((linea) => (
                        <li key={linea} className="flex items-start gap-3">
                          <span className="mt-0.5 text-cyan-600">✓</span>
                          <span className="text-sm leading-relaxed">
                            {linea}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`${REGISTER_HREF}?model=${modelo.tag.toLowerCase()}`}
                      className="mt-7 flex h-[48px] items-center justify-center rounded-md bg-cyan-700 px-6 text-sm font-bold text-white transition-transform hover:scale-105"
                    >
                      Registrarme como {modelo.tag}
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function PasosSection() {
  return (
    <Reveal>
      <section
        className="px-4 py-12 md:px-8"
        aria-labelledby="comercios-pasos-title"
      >
        <div className="mx-auto max-w-7xl">
          <Title
            id="comercios-pasos-title"
            as="h2"
            size="sm"
            font="bold"
            className="max-w-3xl text-3xl leading-tight tracking-[-0.02em] md:text-4xl"
          >
            De registrarte a tu primera venta
          </Title>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PASOS.map((item, i) => (
              <Reveal key={item.paso} delay={0.1 * (i + 1)}>
                <div className="h-full rounded-[28px] border border-black/5 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,.08)] backdrop-blur-xl">
                  <Text size="sm" font="bold" className="text-cyan-700">
                    {item.paso}
                  </Text>

                  <Text font="bold" size="md" className="mt-2">
                    {item.titulo}
                  </Text>

                  <Text size="sm" className="mt-2 leading-relaxed text-gray-500">
                    {item.texto}
                  </Text>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function CostoSection() {
  return (
    <Reveal>
      <section
        className="px-4 py-12 md:px-8"
        aria-labelledby="comercios-costo-title"
      >
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[32px] border border-black/5 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,.08)] backdrop-blur-xl md:p-10">
            <Title
              id="comercios-costo-title"
              as="h2"
              size="sm"
              font="bold"
              className="text-3xl leading-tight tracking-[-0.02em] md:text-4xl"
            >
              Qué te cuesta
            </Title>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-[24px] border border-cyan-200 bg-cyan-50/60 p-5">
                <Text font="bold" size="md" className="text-cyan-900">
                  Registro
                </Text>
                <Text size="sm" className="mt-2 leading-relaxed text-gray-600">
                  Gratis. No se pide tarjeta ni se elige plan para crear la
                  cuenta y publicar.
                </Text>
              </div>

              <div className="rounded-[24px] border border-cyan-200 bg-cyan-50/60 p-5">
                <Text font="bold" size="md" className="text-cyan-900">
                  Vender a residentes (B2C)
                </Text>
                <Text size="sm" className="mt-2 leading-relaxed text-gray-600">
                  Sin costo y sin comisión por venta. El pago lo cobras tú,
                  contraentrega o por transferencia.
                </Text>
              </div>

              <div className="rounded-[24px] border border-black/10 bg-white/70 p-5">
                <Text font="bold" size="md">
                  Vender a la administración (B2B)
                </Text>
                <Text size="sm" className="mt-2 leading-relaxed text-gray-600">
                  Plan de acceso para publicar planes de servicio y firmar
                  contratos. Ves las opciones y su precio dentro de tu panel,
                  antes de pagar nada.
                </Text>
              </div>
            </div>

            <Text size="xs" className="mt-6 text-gray-500">
              Sin permanencia: puedes dejar de publicar cuando quieras y tu
              información se conserva por si vuelves.
            </Text>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function FaqComercios() {
  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <Reveal>
      <section
        className="mx-auto w-full max-w-4xl px-4 py-12 md:px-8"
        aria-labelledby="comercios-faq-title"
      >
        <div className="text-center">
          <Title
            id="comercios-faq-title"
            as="h2"
            size="sm"
            font="bold"
            className="text-3xl md:text-4xl"
          >
            Preguntas frecuentes
          </Title>

          <Text size="md" className="mx-auto mt-4 max-w-2xl text-gray-500">
            Lo que preguntan los negocios antes de registrarse.
          </Text>
        </div>

        <div className="mt-8 space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = abierta === index;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-black/5 bg-white/60 shadow-[0_10px_30px_rgba(0,0,0,.05)] backdrop-blur-xl"
              >
                <button
                  type="button"
                  onClick={() => setAbierta(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold md:text-base">
                    {faq.q}
                  </span>
                  <FaChevronDown
                    className={`shrink-0 text-cyan-700 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5">
                    <Text size="sm" className="leading-relaxed text-gray-600">
                      {faq.a}
                    </Text>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </Reveal>
  );
}

function CierreComercios() {
  return (
    <Reveal>
      <section
        className="relative overflow-hidden px-4 py-16 md:px-8"
        aria-labelledby="comercios-cierre-title"
      >
        <div className="relative z-10 mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0B1120] px-6 py-12 text-center shadow-[0_25px_80px_rgba(0,0,0,.35)] md:px-12 md:py-16">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />

          <div className="relative z-10">
            <Title
              id="comercios-cierre-title"
              as="h2"
              size="sm"
              font="bold"
              className="text-3xl leading-tight text-white md:text-4xl"
            >
              Publica tu negocio hoy y aparece en el próximo pedido
            </Title>

            <Text size="md" className="mx-auto mt-5 max-w-2xl text-white/70">
              Crear la cuenta toma unos minutos y no tiene costo. Si prefieres
              que te expliquemos primero cómo funciona con tu tipo de negocio,
              escríbenos por WhatsApp.
            </Text>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={REGISTER_HREF}
                className="flex h-[52px] w-full items-center justify-center rounded-md bg-cyan-600 px-8 font-semibold text-white transition-all hover:scale-105 hover:bg-cyan-500 sm:w-auto sm:min-w-[260px]"
              >
                Registrar mi negocio gratis
              </Link>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-md border border-white/20 px-6 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-white/5 sm:w-auto sm:min-w-[240px]"
              >
                <FaWhatsapp size={18} />
                Escribir por WhatsApp
              </a>
            </div>

            <Text size="xs" className="mt-6 text-white/50">
              ¿Administras un conjunto y no un negocio?{" "}
              <Link
                href={route.complexes}
                className="underline underline-offset-4 hover:text-white"
              >
                Mira la plataforma para copropiedades
              </Link>
              .
            </Text>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
