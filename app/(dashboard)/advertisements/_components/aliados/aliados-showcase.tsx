"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { InputField, Text, Title } from "complexes-next-components";
import {
  FaBoxOpen,
  FaBuilding,
  FaFileSignature,
  FaMotorcycle,
  FaPercent,
  FaQrcode,
  FaShieldAlt,
  FaStar,
  FaStore,
  FaTags,
  FaTruck,
} from "react-icons/fa";
import { useLanguage } from "@/app/hooks/useLanguage";
import { route } from "@/app/_domain/constants/routes";
import { useAliados } from "@/app/components/aliados/use-aliados";
import { AliadosGrid } from "@/app/components/aliados/aliados-grid";

/**
 * Vitrina pública del ecosistema comercial. Cubre los dos modelos que un
 * comercio puede registrar: B2B (le vende a la copropiedad) y B2C (le vende a
 * los residentes). Solo el directorio B2B tiene datos públicos; las tiendas
 * B2C viven dentro de cada conjunto, así que aquí se explican y se enlaza al
 * acceso del residente.
 */
export default function AliadosShowcase() {
  const { language } = useLanguage();
  const { aliados, isLoading, isError, reload } = useAliados();
  const [search, setSearch] = useState("");

  const term = search.trim().toLowerCase();

  const filtrados = useMemo(() => {
    if (!term) return aliados;
    return aliados.filter((a) =>
      [a.businessName, a.description, a.city, a.country].some((field) =>
        field?.toLowerCase().includes(term),
      ),
    );
  }, [aliados, term]);

  const hayAliados = !isLoading && !isError && aliados.length > 0;

  return (
    <div key={language} className="mx-auto max-w-7xl space-y-16 px-4 pb-16">
      {/* HERO */}
      <header className="relative overflow-hidden rounded-3xl p-8 shadow-xl md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-700 via-cyan-600 to-blue-700" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />

        <div className="relative z-10">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Ecosistema comercial
          </span>

          <Title size="sm" font="bold" className="mt-4 max-w-3xl text-white">
            Comercios aliados dentro y fuera de tu conjunto
          </Title>

          <Text className="mt-3 max-w-3xl text-cyan-50">
            Dos formas de hacer negocio en la misma red: empresas que le prestan
            servicios a la administración de la copropiedad, y negocios de la
            ciudad que atienden directamente a los residentes, con entrega en su
            conjunto y acceso resuelto para el repartidor.
          </Text>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <ModelPill
              icon={<FaBuilding />}
              tag="B2B"
              title="Para la copropiedad"
              description="Mantenimiento, aseo, seguridad, obras. Planes con precio, contrato y calificación."
              anchor="#directorio-b2b"
              cta="Ver directorio"
              stat={hayAliados ? `${aliados.length} activos` : undefined}
            />
            <ModelPill
              icon={<FaStore />}
              tag="B2C"
              title="Para los residentes"
              description="Negocios de la ciudad que atienden al conjunto: catálogo, descuentos y entrega con acceso por QR."
              anchor="#tiendas-b2c"
              cta="Cómo funciona"
            />
          </div>
        </div>
      </header>

      {/* ───────────────────────── B2B ───────────────────────── */}
      <section id="directorio-b2b" className="scroll-mt-28">
        <SectionHeader
          tag="B2B"
          title="Empresas aliadas para tu conjunto"
          description="Proveedores verificados que le prestan servicios directamente a la copropiedad. Publican sus planes y la administración contrata desde la plataforma."
        />

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Benefit
            icon={<FaShieldAlt />}
            title="Proveedores verificados"
            description="Empresas registradas con sus datos de contacto, ubicación y documentación al día."
          />
          <Benefit
            icon={<FaTags />}
            title="Planes con precio claro"
            description="Cada aliado publica sus planes con valor y periodicidad; sin cotizaciones a ciegas."
          />
          <Benefit
            icon={<FaFileSignature />}
            title="Contratos en la plataforma"
            description="La alianza se solicita, se aprueba y queda registrada con su historial."
          />
          <Benefit
            icon={<FaStar />}
            title="Calificaciones reales"
            description="Los conjuntos califican el servicio recibido; la siguiente administración decide con datos."
          />
        </div>

        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Title size="xs" font="bold">
              Directorio de aliados
            </Title>
            <Text size="sm" className="mt-1 text-gray-500">
              Busca por nombre, actividad o ciudad.
            </Text>
          </div>

          {hayAliados ? (
            <div className="w-full md:max-w-sm">
              <InputField
                placeholder="Buscar aliado"
                rounded="lg"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <AliadosGrid
            aliados={filtrados}
            isLoading={isLoading}
            isError={isError}
            onRetry={reload}
            searchTerm={term ? search.trim() : undefined}
            onClearSearch={() => setSearch("")}
          />
        </div>
      </section>

      {/* ───────────────────────── B2C ───────────────────────── */}
      <section id="tiendas-b2c" className="scroll-mt-28">
        <SectionHeader
          tag="B2C"
          title="Negocios de la ciudad que atienden tu conjunto"
          description="Restaurantes, supermercados, farmacias, lavanderías y tiendas cercanas que deciden atender directamente a las familias de una copropiedad. Publican su catálogo, reciben el pedido y lo entregan ellos mismos, sin intermediarios."
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Cómo se ve para el residente */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8">
            <Text font="bold" size="md">
              Lo que ve el residente
            </Text>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Benefit
                icon={<FaBoxOpen />}
                title="Catálogo con precios"
                description="Productos y servicios con foto, precio y disponibilidad real del negocio."
              />
              <Benefit
                icon={<FaPercent />}
                title="Descuentos del comercio"
                description="Promociones que el negocio activa para los conjuntos que atiende."
              />
              <Benefit
                icon={<FaMotorcycle />}
                title="Entrega del propio negocio"
                description="Despacha con su repartidor hasta la puerta del apartamento o la portería."
              />
              <Benefit
                icon={<FaTruck />}
                title="Pedido con seguimiento"
                description="Confirmado, asignado, en camino y entregado; con historial de pedidos."
              />
            </div>

            <div className="mt-7 rounded-2xl bg-cyan-50/70 p-5">
              <Text size="sm" className="text-gray-700">
                Cada negocio elige a qué conjuntos quiere atender, así que el
                catálogo aparece al entrar a tu copropiedad y no en esta página
                pública. No es el marketplace entre vecinos: son empresas
                externas atendiendo al conjunto.
              </Text>

              <div className="mt-4">
                <Link
                  href={route.auth}
                  className="inline-block rounded-full bg-cyan-700 px-6 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-cyan-800"
                >
                  Soy residente, entrar a mi conjunto
                </Link>
              </div>
            </div>
          </div>

          {/* Cómo se ve para el comercio */}
          <div className="rounded-3xl bg-gradient-to-br from-gray-50 to-cyan-50/60 p-6 md:p-8">
            <Text font="bold" size="md">
              Lo que gana el negocio
            </Text>

            <ul className="mt-5 space-y-4">
              <Bullet text="Abres sucursales y eliges a qué conjuntos quieres atender." />
              <Bullet text="Publicas productos y servicios con stock, precio y categorías propias." />
              <Bullet text="Creas descuentos y administras tus repartidores y sus viajes." />
              <Bullet text="Recibes los pedidos y cobras con tu cuenta bancaria registrada." />
              <Bullet text="Demanda concentrada: cientos de hogares en una sola dirección." />
            </ul>

            <Link
              href="/comercio/register"
              className="mt-7 inline-block rounded-full bg-cyan-700 px-6 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105"
            >
              Atender un conjunto
            </Link>
          </div>
        </div>

        {/* ENTRADA AL CONJUNTO: EL DIFERENCIADOR */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-cyan-200 bg-white">
          <div className="border-b border-cyan-100 bg-cyan-50/60 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-700 text-lg text-white">
                <FaQrcode />
              </span>
              <div>
                <Text font="bold" size="md">
                  Tu repartidor no hace fila en la portería
                </Text>
                <Text size="sm" className="mt-1 text-gray-600">
                  La entrega en conjuntos se demora en la entrada, no en la vía.
                  Por eso el acceso está resuelto dentro de la plataforma.
                </Text>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8 lg:grid-cols-4">
            <Step
              number="1"
              title="Agrupa los pedidos"
              description="El comercio junta hasta 10 pedidos del mismo conjunto en un solo viaje, asignado a un repartidor."
            />
            <Step
              number="2"
              title="Se emite el pase"
              description="La plataforma genera un código de acceso único para ese viaje, válido por 3 horas."
            />
            <Step
              number="3"
              title="Portería escanea el QR"
              description="El portero lo lee desde su pantalla de validación y el sistema aprueba o rechaza al instante."
            />
            <Step
              number="4"
              title="La visita queda registrada"
              description="Se anota sola con el nombre, el teléfono y la placa del repartidor, y las unidades que va a recorrer."
            />
          </div>

          <div className="border-t border-gray-100 px-6 pb-6 md:px-8 md:pb-8">
            <Text size="sm" className="text-gray-600">
              El pase se vence solo, se puede revocar y solo sirve en el conjunto
              para el que se emitió. La administración gana trazabilidad de quién
              entró y a qué apartamento; el negocio gana entregas más rápidas.
            </Text>
          </div>
        </div>
      </section>

      {/* CÓMO EMPEZAR */}
      <section className="rounded-3xl bg-gradient-to-br from-gray-50 to-cyan-50/60 p-8 md:p-10">
        <Title size="xs" font="bold">
          ¿Cómo se registra un comercio?
        </Title>
        <Text size="sm" className="mt-1 text-gray-500">
          El mismo formulario para los dos modelos: eliges si le vendes a la
          copropiedad, a los residentes, o a ambos.
        </Text>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Step
            number="1"
            title="Registra tu comercio"
            description="Creas tu cuenta con los datos del negocio y eliges el modelo: B2B, B2C o los dos."
          />
          <Step
            number="2"
            title="Publica lo que ofreces"
            description="Planes de servicio si vendes a la copropiedad; catálogo con precios si vendes a los residentes."
          />
          <Step
            number="3"
            title="Recibe pedidos o alianzas"
            description="Los conjuntos solicitan tu servicio y los residentes te compran, todo desde la plataforma."
          />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden rounded-3xl p-10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600" />

        <div className="relative z-10 space-y-5 text-center">
          <Title size="xs" font="bold" className="text-white">
            ¿Tu negocio quiere vender en conjuntos residenciales?
          </Title>

          <Text className="mx-auto max-w-2xl text-cyan-50">
            Súmate a la red y llega a administraciones que buscan proveedor y a
            familias que compran desde su casa. Te registras una vez y quedas
            visible en los conjuntos donde decidas operar.
          </Text>

          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
            <Link
              href="/comercio/register"
              className="rounded-full bg-white px-7 py-2.5 text-sm font-bold text-cyan-800 transition-transform hover:scale-105"
            >
              Registrar mi comercio
            </Link>
            <Link
              href="/comercio/login"
              className="rounded-full border-2 border-white/70 px-7 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              Ya estoy registrado, entrar
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ModelPill({
  icon,
  tag,
  title,
  description,
  anchor,
  cta,
  stat,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  description: string;
  anchor: string;
  cta: string;
  stat?: string;
}) {
  return (
    <div className="rounded-2xl bg-white/15 p-5 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white">
          {icon}
        </span>
        <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-cyan-800">
          {tag}
        </span>
        {stat ? (
          <span className="ml-auto text-xs font-semibold text-cyan-50">
            {stat}
          </span>
        ) : null}
      </div>

      <Text font="bold" size="sm" className="mt-3 text-white">
        {title}
      </Text>
      <Text size="sm" className="mt-1 text-cyan-50">
        {description}
      </Text>

      <a
        href={anchor}
        className="mt-3 inline-block text-sm font-bold text-white underline underline-offset-4"
      >
        {cta} →
      </a>
    </div>
  );
}

function SectionHeader({
  tag,
  title,
  description,
}: {
  tag: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <span className="inline-block rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
        {tag}
      </span>
      <Title size="sm" font="bold" className="mt-3">
        {title}
      </Title>
      <Text size="sm" className="mt-2 max-w-3xl text-gray-600">
        {description}
      </Text>
    </div>
  );
}

function Benefit({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-lg text-cyan-700">
        {icon}
      </div>
      <Text font="bold" size="sm" className="mt-3">
        {title}
      </Text>
      <Text size="sm" className="mt-1 text-gray-600">
        {description}
      </Text>
    </div>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 text-cyan-600">✔</span>
      <Text size="sm" className="text-gray-700">
        {text}
      </Text>
    </li>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-700 font-bold text-white">
        {number}
      </span>
      <div>
        <Text font="bold" size="sm">
          {title}
        </Text>
        <Text size="sm" className="mt-1 text-gray-600">
          {description}
        </Text>
      </div>
    </div>
  );
}
