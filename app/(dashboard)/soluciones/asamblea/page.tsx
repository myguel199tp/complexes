"use client";
import { Text, Title } from "complexes-next-components";
/* eslint-disable @next/next/no-img-element */
export default function AsambleasPage() {
  return (
    <main className="bg-slate-50 text-gray-900 overflow-hidden">
      <section className="relative border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center">
          <span className="inline-block mb-4 px-4 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full">
            Gobierno digital del conjunto
          </span>

          <Title as="h1" size="md" font="bold" className="md:text-6xl font-extrabold leading-tight">
            Asambleas virtuales y votaciones digitales para propiedad horizontal{" "}
            <br />
          </Title>

          <Text className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
            Realiza asambleas virtuales, registra asistencia y permite
            votaciones seguras desde cualquier lugar, con total validez y
            transparencia.
          </Text>
        </div>
      </section>

      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <Title as="h2" size="sm" font="bold" className="md:text-4xl font-extrabold text-center mb-20">
            Un proceso claro y transparente
          </Title>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              [
                "🗓️",
                "Convocatoria",
                "Envía citaciones digitales y agenda la asamblea.",
              ],
              [
                "👥",
                "Registro de asistencia",
                "El sistema valida automáticamente el quórum según coeficientes.",
              ],
              [
                "🗳️",
                "Votación ponderada",
                "Cada voto se calcula según el coeficiente de propiedad.",
              ],
              ["📊", "Resultados", "Actas y resultados listos al finalizar."],
            ].map(([icon, title, desc]) => (
              <div
                key={title}
                className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="text-4xl mb-4">{icon}</div>
                <Text as="h3" font="semi" className="text-lg">{title}</Text>
                <Text size="sm" className="mt-2 text-gray-600">{desc}</Text>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block mb-3 px-4 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full">
              Módulo de asambleas
            </span>

            <Title as="h2" size="sm" font="bold" className="font-extrabold">
              Decisiones claras, participación garantizada
            </Title>

            <Text className="mt-4 text-gray-600 text-lg">
              Permite que los propietarios participen activamente sin importar
              su ubicación, con votaciones seguras y resultados verificables.
            </Text>

            <ul className="mt-6 space-y-3 text-gray-700">
              <li>✓ Validación automática de quórum</li>
              <li>✓ Votaciones ponderadas por coeficiente</li>
              <li>✓ Resultados en tiempo real</li>
              <li>✓ Historial de votaciones verificable</li>
              <li>✓ Actas digitales descargables</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <img
              src="/pcasambleas.png"
              alt="Asambleas y votaciones digitales"
              className="w-full max-w-sm rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>

      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <Title as="h2" size="sm" font="bold" className="mb-6">Para la administración</Title>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Menos logística y costos</li>
              <li>✓ Cumplimiento normativo</li>
              <li>✓ Resultados inmediatos</li>
            </ul>
          </div>

          <div>
            <Title as="h2" size="sm" font="bold" className="mb-6">Para propietarios</Title>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Participación desde cualquier lugar</li>
              <li>✓ Votos seguros y transparentes</li>
              <li>✓ Información siempre disponible</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Title as="h2" size="sm" font="bold" className="md:text-4xl font-extrabold mb-6">
            Seguridad y transparencia en cada votación
          </Title>

          <Text size="sm" className="max-w-2xl mx-auto text-gray-600 mb-12">
            Cada decisión queda registrada digitalmente para garantizar
            transparencia y confianza entre la administración y los
            propietarios.
          </Text>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border rounded-xl p-6">
              <Text as="h3" font="semi" className="text-lg">Registro seguro</Text>
              <Text size="sm" className="text-gray-600 mt-2">
                Cada voto queda registrado y asociado al propietario.
              </Text>
            </div>

            <div className="border rounded-xl p-6">
              <Text as="h3" font="semi" className="text-lg">Cálculo automático</Text>
              <Text size="sm" className="text-gray-600 mt-2">
                El sistema calcula quórum y resultados automáticamente.
              </Text>
            </div>

            <div className="border rounded-xl p-6">
              <Text as="h3" font="semi" className="text-lg">Resultados verificables</Text>
              <Text size="sm" className="text-gray-600 mt-2">
                Resultados claros y disponibles inmediatamente.
              </Text>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
