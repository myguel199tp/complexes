/* eslint-disable @next/next/no-img-element */
export default function AsambleasPage() {
  return (
    <main className="bg-slate-50 text-gray-900 overflow-hidden">
      {/* ================= HERO LIMPIO ================= */}
      <section className="relative border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center">
          <span className="inline-block mb-4 px-4 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full">
            Gobierno digital del conjunto
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Asambleas y votaciones
            <br />
            <span className="text-indigo-600">100% digitales</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
            Realiza asambleas virtuales, registra asistencia y permite
            votaciones seguras desde cualquier lugar, con total validez y
            transparencia.
          </p>

          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <button className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition">
              Solicitar demo
            </button>
            <button className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
              Ver proceso
            </button>
          </div>
        </div>
      </section>

      {/* ================= PROCESO ================= */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-20">
            Un proceso claro y transparente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              [
                "🗓️",
                "Convocatoria",
                "Envía citaciones digitales y agenda la asamblea.",
              ],
              [
                "👥",
                "Asistencia",
                "Registro automático de quórum y participantes.",
              ],
              ["🗳️", "Votación", "Votos seguros y en tiempo real."],
              ["📊", "Resultados", "Actas y resultados listos al finalizar."],
            ].map(([icon, title, desc]) => (
              <div
                key={title}
                className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= VISUAL + TEXTO ================= */}
      <section className="py-28 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* TEXTO */}
          <div>
            <span className="inline-block mb-3 px-4 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full">
              Módulo de asambleas
            </span>

            <h2 className="text-3xl font-extrabold">
              Decisiones claras, participación garantizada
            </h2>

            <p className="mt-4 text-gray-600 text-lg">
              Permite que los propietarios participen activamente sin importar
              su ubicación, con votaciones seguras y resultados verificables.
            </p>

            <ul className="mt-6 space-y-3 text-gray-700">
              <li>✓ Validación de quórum automática</li>
              <li>✓ Votaciones ponderadas por coeficiente</li>
              <li>✓ Actas digitales descargables</li>
            </ul>
          </div>

          {/* IMAGEN */}
          <div className="flex justify-center">
            <img
              src="/pcasambleas.png"
              alt="Asambleas y votaciones digitales"
              className="w-full max-w-sm rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* ================= BENEFICIOS ================= */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Para la administración</h2>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Menos logística y costos</li>
              <li>✓ Cumplimiento normativo</li>
              <li>✓ Resultados inmediatos</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Para propietarios</h2>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Participación desde cualquier lugar</li>
              <li>✓ Votos seguros y transparentes</li>
              <li>✓ Información siempre disponible</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="py-24 bg-indigo-600 text-white text-center">
        <h2 className="text-4xl font-extrabold">Moderniza tus asambleas</h2>
        <p className="mt-4 max-w-xl mx-auto text-indigo-100">
          Toma decisiones importantes de forma digital, segura y organizada.
        </p>
        <button className="mt-8 px-10 py-4 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 transition">
          Solicitar demostración
        </button>
      </section>
    </main>
  );
}
