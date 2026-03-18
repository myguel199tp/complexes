"use client";
import { Title, Text } from "complexes-next-components";

export default function AboutPage() {
  return (
    <main className="relative bg-slate-100 overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-400/30 rounded-full blur-3xl" />
      <div className="absolute top-[30%] -right-40 w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-200px] left-[20%] w-[500px] h-[500px] bg-fuchsia-400/20 rounded-full blur-3xl" />

      <section className="relative py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <Title as="h1" font="bold" className="text-2xl sm:text-4xl">
            Sobre SmartPH
          </Title>
          <Text className="mt-4 text-gray-600 max-w-2xl sm:max-w-3xl mx-auto text-base sm:text-lg break-words">
            Un ecosistema digital que transforma la forma en que los conjuntos
            residenciales se administran, se conectan y generan valor.
          </Text>
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24">
        <div className="grid md:grid-cols-2 gap-10 sm:gap-16 items-center">
          <div>
            <Title as="h2" font="bold" className="text-xl sm:text-3xl">
              Un club digital con propósito
            </Title>
            <Text className="mt-6 text-gray-700 leading-relaxed text-base sm:text-lg break-words">
              SmartPH es un{" "}
              <strong>Club Digital de Conjuntos Residenciales</strong>, una red
              privada de copropiedades que comparten una infraestructura
              tecnológica común para operar de forma más eficiente y
              colaborativa.
            </Text>
            <Text className="mt-4 text-gray-700 leading-relaxed text-base sm:text-lg break-words">
              Cada conjunto se integra a un ecosistema vivo donde la
              participación activa, el uso continuo y la conexión con otros
              actores generan beneficios reales y sostenibles.
            </Text>
          </div>

          <div className="relative">
            <div className="rounded-3xl bg-white/60 backdrop-blur-xl shadow-xl p-6 sm:p-10">
              <p className="text-xs sm:text-sm uppercase tracking-wide text-cyan-700 mb-2">
                Ecosistema
              </p>
              <p className="text-lg sm:text-xl text-gray-800 font-medium break-words">
                Más que software, una red que crece con cada conjunto afiliado.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24">
        <div className="grid md:grid-cols-2 gap-10 sm:gap-16 items-center">
          <div className="relative order-2 md:order-1">
            <div className="rounded-3xl bg-white/60 backdrop-blur-xl shadow-xl p-6 sm:p-10">
              <p className="text-xs sm:text-sm uppercase tracking-wide text-indigo-700 mb-2">
                Diferencial
              </p>
              <p className="text-lg sm:text-xl text-gray-800 font-medium break-words">
                La fuerza de SmartPH está en la red, no solo en la herramienta.
              </p>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <Title as="h2" font="bold" className="text-xl sm:text-3xl">
              Un modelo distinto al tradicional
            </Title>
            <Text className="mt-6 text-gray-700 leading-relaxed text-base sm:text-lg break-words">
              A diferencia de un software convencional, SmartPH construye valor
              a partir de la colaboración entre conjuntos afiliados. El volumen,
              la continuidad y la adopción real permiten crear incentivos
              compartidos.
            </Text>
            <Text className="mt-4 text-gray-700 leading-relaxed text-base sm:text-lg break-words">
              El ecosistema integra comunicación, administración, mantenimiento,
              asambleas, alquileres y servicios, junto con un modelo de
              membresías <strong>Básico, Oro y Platino</strong>.
            </Text>
          </div>
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-lg p-6 sm:p-10">
            <Title as="h3" font="bold" className="text-lg sm:text-2xl">
              Misión
            </Title>
            <Text className="mt-4 text-gray-700 text-base sm:text-lg leading-relaxed break-words">
              Impulsar la transformación digital de los conjuntos residenciales
              mediante un ecosistema interconectado que los una como una red,
              donde personas, procesos y oportunidades dejan de operar de forma
              aislada para crecer, colaborar y evolucionar juntos de manera
              sostenible.
            </Text>
          </div>

          <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-lg p-6 sm:p-10">
            <Title as="h3" font="bold" className="text-lg sm:text-2xl">
              Visión
            </Title>
            <Text className="mt-4 text-gray-700 text-base sm:text-lg leading-relaxed break-words">
              Para el año <strong>2036</strong>, ser el ecosistema digital de
              referencia para conjuntos residenciales en todo el continente
              americano, conectando miles de comunidades bajo un mismo modelo
              tecnológico que impulse eficiencia, colaboración y crecimiento
              sostenible a escala regional.
            </Text>
          </div>
        </div>
      </section>

      <section className="relative pb-24 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-2xl">
          <Title
            as="h2"
            size="sm"
            font="bold"
            colVariant="on"
            className="text-lg sm:text-2xl"
          >
            Un ecosistema que crea valor real
          </Title>
          <Text className="mt-4 text-slate-300 text-sm sm:text-base break-words">
            SmartPH conecta conjuntos, personas y oportunidades para construir
            una nueva forma de administrar y vivir la propiedad horizontal.
          </Text>
        </div>
      </section>
    </main>
  );
}
