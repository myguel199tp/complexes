"use client";

import { Title, Text } from "complexes-next-components";
import { useLanguage } from "@/app/hooks/useLanguage";
import Link from "next/link";

const partners = [
  {
    name: "Starbucks",
    discount: "10% OFF",
    description: "Descuento exclusivo en bebidas y productos seleccionados.",
  },
  {
    name: "Gym Local",
    discount: "15% OFF",
    description: "Acceso con tarifa preferencial para miembros.",
  },
  {
    name: "Tienda Tecnológica",
    discount: "20% OFF",
    description: "Beneficios en dispositivos y accesorios electrónicos.",
  },
];

export default function Alianz() {
  const { language } = useLanguage();

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
              Las alianzas permiten aumentar la visibilidad de tu negocio,
              generar tráfico y fortalecer la fidelización de clientes.
            </Text>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-8 shadow-inner">
            <Title size="xs" font="bold">
              ¿Cómo funciona para tu negocio?
            </Title>

            <ul className="space-y-4 mt-4">
              <ListItem text="Registras tu negocio como aliado dentro del ecosistema." />
              <ListItem text="Publicas un beneficio o descuento exclusivo." />
              <ListItem text="Tu marca se expone a la comunidad de usuarios activos." />
              <ListItem text="Los miembros visitan tu negocio y generas nuevas oportunidades de venta." />
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-10 shadow-xl space-y-8">
          <Title size="sm" font="bold">
            Empresas Aliadas
          </Title>

          <div className="grid md:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <Text font="bold">{partner.name}</Text>

                <Text className="mt-2 text-green-600 font-semibold">
                  {partner.discount}
                </Text>

                <Text className="mt-2 text-gray-600 text-sm">
                  {partner.description}
                </Text>
              </div>
            ))}
          </div>
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
