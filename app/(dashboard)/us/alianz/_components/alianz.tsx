"use client";

import { Title, Button, Text } from "complexes-next-components";
import React, { useState } from "react";
import { useLanguage } from "@/app/hooks/useLanguage";
import Form from "./form";

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

/* ================= PAGE ================= */

export default function Alianz() {
  // const { t } = useTranslation();
  const { language } = useLanguage();
  const [showAlianz, setShowAlianz] = useState<boolean>(false);
  const openAlianz = () => setShowAlianz(true);
  const closeAlianz = () => setShowAlianz(false);

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
                Programa de Alianzas y Beneficios
              </Title>

              <Text className="text-cyan-100 mt-3">
                Creamos una red de empresas que ofrecen descuentos y beneficios
                exclusivos para miembros del ecosistema. Más colaboración, más
                valor y más crecimiento para todos.
              </Text>
            </div>

            <Button
              colVariant="warning"
              className="flex items-center gap-2 self-start px-6 py-3"
              onClick={openAlianz}
            >
              Quiero ser aliado
            </Button>
          </div>
        </header>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-lg space-y-4">
            <Title size="xs" font="bold">
              ¿Qué son las alianzas?
            </Title>

            <Text>
              Son acuerdos estratégicos con empresas que ofrecen descuentos
              exclusivos a los miembros registrados dentro de la plataforma.
            </Text>

            <Text>
              Estas alianzas generan valor tanto para la comunidad como para las
              empresas que participan en la red.
            </Text>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-8 shadow-inner">
            <Title size="xs" font="bold">
              ¿Cómo funcionan?
            </Title>

            <ul className="space-y-4 mt-4">
              <ListItem text="Te registras como miembro activo." />
              <ListItem text="Accedes a descuentos exclusivos." />
              <ListItem text="Presentas tu credencial o código aliado." />
              <ListItem text="Disfrutas beneficios inmediatos." />
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
              ¿Tu empresa quiere formar parte de nuestra red?
            </Title>

            <Text className="text-cyan-100 max-w-2xl mx-auto">
              Si deseas ofrecer beneficios exclusivos y posicionar tu marca
              dentro de nuestra comunidad, conviértete en aliado estratégico.
            </Text>

            <Button
              colVariant="warning"
              onClick={openAlianz}
              className="px-8 py-3"
            >
              Quiero ser aliado
            </Button>
          </div>
        </section>
      </section>
      {showAlianz && <Form isOpen onClose={closeAlianz} />}
    </>
  );
}

/* ================= COMPONENTS ================= */

function ListItem({ text }: { text: string }) {
  return (
    <li className="flex gap-3 items-start">
      <span className="text-cyan-600 mt-1">✔</span>
      <Text>{text}</Text>
    </li>
  );
}
