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
    <section className="space-y-6">
      {/* Header */}
      <header
        key={language}
        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-cyan-700 to-cyan-800 px-5 py-4 shadow"
      >
        <Title size="xs" font="bold" className="text-white">
          Participación e incentivos del club
        </Title>

        <Button
          colVariant="warning"
          className="flex items-center gap-2"
          onClick={handleRegister}
          disabled={isPending}
        >
          {t("inscripcion")}
          {isPending && <ImSpinner9 className="animate-spin" />}
        </Button>
      </header>

      {/* Introducción */}
      <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
        <Text>
          El club ofrece a los conjuntos residenciales la posibilidad de
          participar en beneficios económicos derivados del uso de la
          plataforma, especialmente a través de la gestión de alquileres
          temporales.
        </Text>

        <Text className="text-gray-600">
          Estos beneficios no representan ingresos garantizados ni automáticos.
          Su asignación depende del uso continuo del sistema, del plan activo y
          de las políticas vigentes del club.
        </Text>
      </div>

      {/* Grid principal */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Herramientas */}
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
          <Title size="sm" font="bold">
            Herramientas para el conjunto
          </Title>

          <ul className="space-y-2">
            <li className="flex gap-2">
              <span>✔</span>
              <Text>
                Gestión organizada de reservas temporales y control de
                ocupación.
              </Text>
            </li>
            <li className="flex gap-2">
              <span>✔</span>
              <Text>
                Control de accesos de visitantes con trazabilidad y seguridad.
              </Text>
            </li>
            <li className="flex gap-2">
              <span>✔</span>
              <Text>
                Apoyo a la convivencia y al cumplimiento de normas internas.
              </Text>
            </li>
          </ul>
        </div>

        {/* Modelo */}
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
          <Title size="sm" font="bold">
            Modelo de beneficios
          </Title>

          <Text>
            El modelo del club contempla beneficios comunitarios que se otorgan
            de forma base y beneficios adicionales que varían según el plan
            activo y el nivel de uso de la plataforma.
          </Text>
        </div>
      </div>

      {/* Beneficio base */}
      <div className="rounded-xl border bg-cyan-50 p-5 shadow-sm space-y-3">
        <Title size="sm" font="bold">
          Beneficio base del club
        </Title>

        <Text>
          Los conjuntos que mantengan un uso continuo de la plataforma pueden
          acceder a un beneficio base otorgado directamente por el club, incluso
          en periodos donde no se generen reservas.
        </Text>

        <Text className="text-gray-700">
          Este beneficio es asumido exclusivamente por el club y no impacta las
          ganancias del anfitrión ni los ingresos propios del conjunto.
        </Text>
      </div>

      {/* Planes */}
      <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
        <Title size="sm" font="bold">
          Beneficios adicionales por nivel de plan
        </Title>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-cyan-50 p-4">
            <Text font="bold">🩵 Plan Básico</Text>
            <Text>
              Acceso a beneficios adicionales de nivel inicial, sujetos a las
              condiciones del club.
            </Text>
          </div>

          <div className="rounded-lg bg-yellow-50 p-4">
            <Text font="bold">🟡 Plan Oro</Text>
            <Text>
              Beneficios ampliados y mayor participación según el uso y
              permanencia en el plan.
            </Text>
          </div>

          <div className="rounded-lg bg-purple-50 p-4">
            <Text font="bold">💎 Plan Platino</Text>
            <Text>
              Nivel superior de beneficios, con condiciones preferenciales
              definidas por el club.
            </Text>
          </div>
        </div>
      </div>

      {/* Condiciones */}
      <div className="rounded-xl border bg-gray-50 p-5 shadow-sm space-y-3">
        <Title size="sm" font="bold">
          Condiciones generales
        </Title>

        <Text>
          La asignación y liquidación de los beneficios se realiza conforme a
          las políticas vigentes del club y puede variar según el periodo, el
          plan activo y el comportamiento de uso.
        </Text>

        <Text>
          En caso de cambios de plan, los beneficios se ajustarán de manera
          proporcional al tiempo de permanencia en cada nivel.
        </Text>

        <Text>
          El club se reserva el derecho de actualizar, modificar o ajustar el
          modelo de beneficios cuando sea necesario, garantizando siempre la
          transparencia del proceso.
        </Text>
      </div>
    </section>
  );
}
