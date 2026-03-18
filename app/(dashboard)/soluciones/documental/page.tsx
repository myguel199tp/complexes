export default function DocumentalPage() {
  return (
    <main className="bg-gray-950 text-white">
      <section className="py-28 text-center max-w-5xl mx-auto px-6">
        <h1 className="text-5xl font-bold leading-tight">
          Gestión documental segura para tu propiedad horizontal
        </h1>

        <p className="mt-6 text-lg text-gray-400">
          Centraliza reglamentos, actas, contratos y documentos importantes en
          un repositorio seguro donde el administrador controla qué información
          puede ver toda la comunidad.
        </p>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl">
          <h3 className="text-xl font-semibold mb-3">
            Repositorio centralizado
          </h3>

          <p className="text-gray-400">
            Guarda todos los documentos importantes del conjunto en un solo
            lugar. Reglamentos, actas de asamblea, contratos, informes y más.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl">
          <h3 className="text-xl font-semibold mb-3">Control de visibilidad</h3>

          <p className="text-gray-400">
            El administrador decide qué documentos son públicos para toda la
            comunidad y cuáles permanecen privados para la administración.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl">
          <h3 className="text-xl font-semibold mb-3">Acceso seguro</h3>

          <p className="text-gray-400">
            Los documentos están protegidos y solo los usuarios autorizados
            pueden acceder a ellos desde la plataforma.
          </p>
        </div>
      </section>
      <section className="bg-gray-900 py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold">
              Mantén la información organizada y accesible
            </h2>

            <p className="mt-6 text-gray-400">
              Evita perder documentos importantes en correos o grupos de
              mensajería. Nuestra plataforma permite almacenar y organizar
              archivos de forma estructurada para que los residentes puedan
              acceder a la información cuando la necesiten.
            </p>

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
        <h2 className="text-3xl font-bold">
          Simplifica la gestión documental de tu conjunto
        </h2>

        <p className="mt-4 text-gray-400">
          Mantén toda la información importante organizada y disponible para tu
          comunidad de forma segura.
        </p>
      </section>
    </main>
  );
}
