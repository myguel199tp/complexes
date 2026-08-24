"use client";
import { Text, Title } from "complexes-next-components";
export default function DocumentalPage() {
  return (
    <main className="bg-gray-950 text-white">
      <section className="py-28 text-center max-w-5xl mx-auto px-6">
        <Title as="h1" size="md" font="bold" className="leading-tight">
          Gestión documental segura para tu propiedad horizontal
        </Title>

        <Text className="mt-6 text-lg text-gray-400">
          Centraliza reglamentos, actas, contratos y documentos importantes en
          un repositorio seguro donde el administrador controla qué información
          puede ver toda la comunidad.
        </Text>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl">
          <Text as="h3" size="md" font="semi" className="mb-3">
            Repositorio centralizado
          </Text>

          <Text size="sm" className="text-gray-400">
            Guarda todos los documentos importantes del conjunto en un solo
            lugar. Reglamentos, actas de asamblea, contratos, informes y más.
          </Text>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl">
          <Text as="h3" size="md" font="semi" className="mb-3">Control de visibilidad</Text>

          <Text size="sm" className="text-gray-400">
            El administrador decide qué documentos son públicos para toda la
            comunidad y cuáles permanecen privados para la administración.
          </Text>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl">
          <Text as="h3" size="md" font="semi" className="mb-3">Acceso seguro</Text>

          <Text size="sm" className="text-gray-400">
            Los documentos están protegidos y solo los usuarios autorizados
            pueden acceder a ellos desde la plataforma.
          </Text>
        </div>
      </section>
      <section className="bg-gray-900 py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <Title as="h2" size="sm" font="bold">
              Mantén la información organizada y accesible
            </Title>

            <Text size="sm" className="mt-6 text-gray-400">
              Evita perder documentos importantes en correos o grupos de
              mensajería. Nuestra plataforma permite almacenar y organizar
              archivos de forma estructurada para que los residentes puedan
              acceder a la información cuando la necesiten.
            </Text>

            <ul className="mt-8 space-y-3 text-gray-300">
              <li>✔ Publicación de documentos para la comunidad</li>
              <li>✔ Archivos privados para la administración</li>
              <li>✔ Organización por categorías</li>
              <li>✔ Descarga segura de archivos</li>
            </ul>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl h-[320px] flex items-center justify-center text-gray-500">
            Vista previa del módulo
          </div>
        </div>
      </section>
      <section className="py-24 text-center max-w-4xl mx-auto px-6">
        <Title as="h2" size="sm" font="bold">
          Simplifica la gestión documental de tu conjunto
        </Title>

        <Text size="sm" className="mt-4 text-gray-400">
          Mantén toda la información importante organizada y disponible para tu
          comunidad de forma segura.
        </Text>
      </section>
    </main>
  );
}
