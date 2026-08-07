"use client";

import { Title, Text } from "complexes-next-components";
import { useLanguage } from "@/app/hooks/useLanguage";
import Link from "next/link";
import { useAliados } from "@/app/components/aliados/use-aliados";
import { AliadosGrid } from "@/app/components/aliados/aliados-grid";

export default function Alianz() {
  const { language } = useLanguage();
  const { aliados, isLoading, isError, reload } = useAliados();

  return (
    <>
      <section className="space-y-12">
        <header
          key={language}
          className="relative overflow-hidden rounded-3xl p-10 shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-700 via-cyan-600 to-blue-700 opacity-90" />
          <div className="absolute inset-0 bg-cyan-400/30 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div className="max-w-2xl">
              <Title size="sm" font="bold" className="text-white">
                Programa de Alianzas Comerciales
              </Title>

              <Text className="text-cyan-100 mt-3">
                Conecta tu negocio con una comunidad activa y atrae nuevos
                clientes ofreciendo beneficios exclusivos dentro de nuestro
                ecosistema.
              </Text>
            </div>
          </div>
        </header>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-lg space-y-4">
            <Title size="xs" font="bold">
              ¿Qué es ser aliado?
            </Title>

            <Text>
              Es formar parte de una red de comercios que conectan con nuevos
              clientes dentro de la plataforma, ofreciendo beneficios exclusivos
              a una comunidad activa.
            </Text>

            <Text>
              Puedes vender de dos formas, y no son excluyentes:{" "}
              <strong>B2C</strong>, con tu tienda visible para los residentes de
              los conjuntos, y <strong>B2B</strong>, prestándole servicios
              directamente a la administración de la copropiedad.
            </Text>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-8 shadow-inner">
            <Title size="xs" font="bold">
              ¿Cómo funciona para tu negocio?
            </Title>

            <ul className="space-y-4 mt-4">
              <ListItem text="Registras tu comercio y eliges tu modelo: B2C, B2B o ambos." />
              <ListItem text="Publicas tus productos, descuentos o planes de servicio con su precio." />
              <ListItem text="Tu marca queda visible en el directorio de aliados y en las tiendas de los conjuntos." />
              <ListItem text="Recibes pedidos o solicitudes de alianza, con contrato y calificación en la plataforma." />
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-10 shadow-xl space-y-6">
          <div>
            <Title size="sm" font="bold">
              Empresas Aliadas
            </Title>
            <Text size="sm" className="mt-1 text-gray-500">
              Comercios B2B que hoy prestan servicios a los conjuntos de la red.
            </Text>
          </div>

          <AliadosGrid
            aliados={aliados}
            isLoading={isLoading}
            isError={isError}
            onRetry={reload}
            skeletonCount={3}
          />
        </section>

        <section className="relative rounded-3xl p-10 overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600" />

          <div className="relative z-10 text-center space-y-6">
            <Title size="sm" font="bold" className="text-white">
              ¿Quieres atraer más clientes a tu negocio?
            </Title>

            <Text className="text-cyan-100 max-w-2xl mx-auto">
              Únete como aliado y posiciona tu marca dentro de una comunidad
              activa, generando nuevas oportunidades de crecimiento a través de
              beneficios exclusivos.
            </Text>

            <div className="flex justify-center gap-4 mt-6">
              <Link href="/comercio/register" className="text-white font-bold">
                Registrar mi comercio
              </Link>
            </div>
          </div>
        </section>
      </section>
    </>
  );
}

function ListItem({ text }: { text: string }) {
  return (
    <li className="flex gap-3 items-start">
      <span className="text-cyan-600 mt-1">✔</span>
      <Text>{text}</Text>
    </li>
  );
}
