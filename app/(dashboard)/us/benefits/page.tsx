"use client";

import { route } from "@/app/_domain/constants/routes";
import { Title, Button, Text } from "complexes-next-components";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { ImSpinner9 } from "react-icons/im";

export default function Page() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isPending, startTransition] = useTransition();

  const handleRegister = () => {
    startTransition(() => {
      router.push(route.registerComplex);
    });
  };

  return (
    <section className="space-y-12">
      {/* HERO */}
      <header
        key={language}
        className="relative overflow-hidden rounded-2xl p-8 shadow-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-700 via-cyan-600 to-blue-700 opacity-90" />
        <div className="absolute inset-0 blur-2xl bg-cyan-400/30" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Title size="sm" font="bold" className="text-white">
              Participación e incentivos del club
            </Title>
            <Text className="text-cyan-100 mt-2 max-w-xl">
              Un modelo colaborativo donde los conjuntos crecen como parte de
              una red, no como entidades aisladas.
            </Text>
          </div>

          <Button
            colVariant="warning"
            className="flex items-center gap-2 self-start"
            onClick={handleRegister}
            disabled={isPending}
          >
            {t("inscripcion")}
            {isPending && <ImSpinner9 className="animate-spin" />}
          </Button>
        </div>
      </header>

      {/* INTRO */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl p-8 shadow-lg">
          <Text className="text-gray-800 leading-relaxed">
            El club permite a los conjuntos residenciales participar en
            beneficios económicos derivados del uso responsable y continuo de la
            plataforma, especialmente mediante la gestión de alquileres
            temporales.
          </Text>

          <Text className="text-gray-600 mt-4">
            Estos beneficios no son automáticos ni garantizados. Su asignación
            depende del plan activo, el uso sostenido del sistema y las
            políticas vigentes del club.
          </Text>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 shadow-inner">
          <Title size="xs" font="bold">
            Enfoque del club
          </Title>
          <Text className="mt-3 text-gray-700">
            Construir una red donde los conjuntos participan, colaboran y se
            fortalecen juntos dentro del ecosistema ComplexesPH.
          </Text>
        </div>
      </section>

      {/* HERRAMIENTAS + MODELO */}
      <section className="grid md:grid-cols-2 gap-6">
        <Card title="Herramientas para el conjunto">
          <ul className="space-y-3">
            <ListItem text="Gestión organizada de reservas temporales y control de ocupación." />
            <ListItem text="Control de accesos de visitantes con trazabilidad y seguridad." />
            <ListItem text="Apoyo a la convivencia y cumplimiento de normas internas." />
          </ul>
        </Card>

        <Card title="Modelo de beneficios">
          <Text>
            El modelo contempla beneficios comunitarios base y beneficios
            adicionales que varían según el plan activo y el nivel de uso de la
            plataforma dentro del ecosistema.
          </Text>
        </Card>
      </section>

      {/* BENEFICIO BASE */}
      <section className="relative rounded-2xl p-8 shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100" />
        <div className="relative z-10">
          <Title size="sm" font="bold">
            Beneficio base del club
          </Title>

          <Text className="mt-4">
            Los conjuntos que mantengan un uso continuo pueden acceder a un
            beneficio base otorgado directamente por el club, incluso en
            periodos sin reservas.
          </Text>

          <Text className="mt-2 text-gray-700">
            Este beneficio es asumido exclusivamente por el club y no afecta los
            ingresos del anfitrión ni del conjunto.
          </Text>
        </div>
      </section>

      {/* PLANES */}
      <section className="bg-white rounded-2xl p-8 shadow-xl space-y-6">
        <Title size="sm" font="bold">
          Beneficios adicionales por nivel de plan
        </Title>

        <div className="grid md:grid-cols-3 gap-6">
          <PlanCard title="🩵 Plan Básico" color="cyan">
            Beneficios iniciales sujetos a condiciones y uso continuo.
          </PlanCard>

          <PlanCard title="🟡 Plan Oro" color="yellow">
            Mayor participación y beneficios ampliados según permanencia.
          </PlanCard>

          <PlanCard title="💎 Plan Platino" color="purple">
            Nivel superior con condiciones preferenciales del club.
          </PlanCard>
        </div>
      </section>

      {/* CONDICIONES */}
      <section className="bg-gray-50 rounded-2xl p-8 shadow-inner space-y-4">
        <Title size="sm" font="bold">
          Condiciones generales
        </Title>

        <Text>
          La asignación de beneficios se realiza conforme a las políticas
          vigentes del club y puede variar según periodo, plan y uso.
        </Text>

        <Text>
          En cambios de plan, los beneficios se ajustan proporcionalmente al
          tiempo de permanencia.
        </Text>

        <Text>
          El club puede actualizar el modelo garantizando siempre transparencia
          y comunicación oportuna.
        </Text>
      </section>
    </section>
  );
}

/* COMPONENTES AUXILIARES */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg space-y-4">
      <Title size="xs" font="bold">
        {title}
      </Title>
      {children}
    </div>
  );
}

function ListItem({ text }: { text: string }) {
  return (
    <li className="flex gap-3 items-start">
      <span className="mt-1 text-cyan-600">✔</span>
      <Text>{text}</Text>
    </li>
  );
}

function PlanCard({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: "cyan" | "yellow" | "purple";
}) {
  const colors = {
    cyan: "from-cyan-50 to-cyan-100",
    yellow: "from-yellow-50 to-yellow-100",
    purple: "from-purple-50 to-purple-100",
  };

  return (
    <div
      className={`rounded-xl p-6 bg-gradient-to-br ${colors[color]} shadow-md`}
    >
      <Text font="bold">{title}</Text>
      <Text className="mt-2">{children}</Text>
    </div>
  );
}
