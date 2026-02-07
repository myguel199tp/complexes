export default function AdministradoresPage() {
  return (
    <main className="bg-gray-50">
      {/* HERO */}
      <section className="py-20 bg-gradient-to-r from-cyan-800 to-cyan-900 text-white text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Administración con control y claridad
        </h1>
        <p className="mt-4 text-cyan-100 max-w-3xl mx-auto text-lg">
          Digitalizar la gestión del conjunto reduce la carga operativa, ordena
          la información y permite tomar decisiones con datos claros.
        </p>
      </section>

      {/* CONTEXTO DEL ADMINISTRADOR */}
      <section className="py-16 max-w-6xl mx-auto px-6 text-center">
        <p className="text-gray-700 text-lg max-w-4xl mx-auto">
          La administración tradicional implica múltiples tareas repetitivas,
          información dispersa y comunicación constante por diferentes canales.
          La digitalización transforma ese caos en procesos claros y
          centralizados.
        </p>
      </section>

      {/* RETOS DIARIOS → SOLUCIÓN DIGITAL */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Lo que cambia al administrar de forma digital
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-cyan-700 mb-3">
                Control financiero
              </h3>
              <p className="text-gray-600">
                La información económica deja de estar dispersa y se vuelve
                consultable, ordenada y fácil de supervisar.
              </p>
            </div>

            <div className="p-8 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-cyan-700 mb-3">
                Procesos definidos
              </h3>
              <p className="text-gray-600">
                Menos tareas manuales, menos reprocesos y más consistencia en la
                operación diaria del conjunto.
              </p>
            </div>

            <div className="p-8 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-cyan-700 mb-3">
                Comunicación ordenada
              </h3>
              <p className="text-gray-600">
                Los mensajes llegan al lugar correcto, en el momento adecuado y
                sin depender de llamadas o mensajes informales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CIERRE FIRME */}
      <section className="py-20 bg-cyan-900 text-white text-center px-6">
        <h2 className="text-3xl font-bold mb-4">
          Administrar con menos fricción
        </h2>
        <p className="text-cyan-100 text-lg max-w-3xl mx-auto">
          La digitalización no cambia la responsabilidad del administrador,
          cambia la forma de ejercerla: con más control, menos desgaste y mayor
          confianza.
        </p>
      </section>
    </main>
  );
}
