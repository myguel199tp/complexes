export default function ConjuntosPage() {
  return (
    <main className="bg-gray-50">
      {/* HERO */}
      <section className="py-20 bg-gradient-to-r from-cyan-700 to-cyan-900 text-white text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          El futuro de los conjuntos residenciales es digital
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-cyan-100">
          Administrar un conjunto hoy ya no es solo llevar cuentas, es crear
          orden, confianza y una mejor experiencia para todos.
        </p>
      </section>

      {/* CONTEXTO */}
      <section className="py-16 max-w-6xl mx-auto px-6 text-center">
        <p className="text-gray-700 text-lg max-w-4xl mx-auto">
          Los conjuntos residenciales están evolucionando. La información en
          papel, los mensajes dispersos y los procesos manuales generan
          retrasos, confusión y pérdida de tiempo. La digitalización transforma
          esta realidad en algo más simple, claro y organizado.
        </p>
      </section>

      {/* IDEAS CLAVE */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-cyan-700 mb-3">
                Orden y claridad
              </h3>
              <p className="text-gray-600">
                Toda la información del conjunto en un solo lugar, accesible
                cuando se necesita y sin depender de terceros.
              </p>
            </div>

            <div className="p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-cyan-700 mb-3">
                Tiempo mejor aprovechado
              </h3>
              <p className="text-gray-600">
                Menos tareas repetitivas, menos preguntas frecuentes y más
                tiempo para enfocarse en lo realmente importante.
              </p>
            </div>

            <div className="p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-cyan-700 mb-3">
                Comunidad conectada
              </h3>
              <p className="text-gray-600">
                La comunicación fluye, las decisiones se entienden y los
                residentes se sienten parte del conjunto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CIERRE CONCEPTUAL */}
      <section className="py-20 bg-cyan-900 text-white text-center px-6">
        <h2 className="text-3xl font-bold mb-4">
          Digitalizar no es cambiar la esencia,
        </h2>
        <p className="text-cyan-100 text-lg max-w-3xl mx-auto">
          es darle al conjunto las herramientas para funcionar mejor, con menos
          fricción y más tranquilidad en el día a día.
        </p>
      </section>
    </main>
  );
}
