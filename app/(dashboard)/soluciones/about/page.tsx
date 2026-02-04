"use client";
import { Title, Text } from "complexes-next-components";

export default function AboutPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="py-14 bg-cyan-800 text-center">
        <Title as="h1" font="bold" colVariant="on">
          Sobre ComplexesPH
        </Title>
        <Text className="mt-3 text-cyan-100 max-w-2xl mx-auto">
          Club Digital para Conjuntos Residenciales
        </Text>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Intro */}
        <div className="space-y-4">
          <Text className="text-gray-700 leading-relaxed">
            ComplexesPH es un{" "}
            <strong>Club Digital de Conjuntos Residenciales</strong>, una red
            privada que conecta copropiedades a través de una plataforma
            tecnológica común. Su propósito es facilitar la administración de
            procesos internos y, al mismo tiempo, generar beneficios económicos
            reales para los conjuntos que participan activamente en el
            ecosistema.
          </Text>
        </div>

        {/* Diferenciador */}
        <div className="space-y-4">
          <Title as="h3" font="bold">
            ¿Qué diferencia a ComplexesPH de un software tradicional?
          </Title>

          <Text className="text-gray-700 leading-relaxed">
            El valor principal del proyecto no está únicamente en la
            herramienta, sino en la <strong>red de conjuntos afiliados</strong>.
            A través de la colaboración, el volumen de uso y la participación
            continua, se generan incentivos compartidos.
          </Text>

          <Text className="text-gray-700 leading-relaxed">
            Los conjuntos acceden a un sistema integral de gestión que incluye
            comunicación, administración, mantenimiento, asambleas, alquileres y
            servicios. Adicionalmente, participan en un modelo de incentivos
            económicos, principalmente a través de alquileres gestionados desde
            la plataforma.
          </Text>

          <Text className="text-gray-700 leading-relaxed">
            El club opera bajo planes de membresía{" "}
            <strong>Básico, Oro y Platino</strong>, donde el porcentaje de
            beneficio depende del nivel de afiliación y del uso continuo e
            ininterrumpido de la plataforma durante periodos semestrales. Este
            modelo fomenta la permanencia, la adopción real del sistema y el
            crecimiento orgánico de la red.
          </Text>
        </div>

        {/* Objetivo */}
        <div className="space-y-4">
          <Title as="h3" font="bold">
            ¿Cuál es el objetivo de ComplexesPH?
          </Title>

          <Text className="text-gray-700 leading-relaxed">
            Construir una{" "}
            <strong>comunidad sostenible de conjuntos residenciales</strong>,
            donde todos los miembros ganen: los conjuntos obtienen ingresos
            adicionales y eficiencia operativa, los residentes acceden a más
            servicios y beneficios, y la plataforma monetiza mediante
            suscripciones y participación en las transacciones generadas dentro
            del ecosistema.
          </Text>
        </div>
      </section>
    </main>
  );
}
