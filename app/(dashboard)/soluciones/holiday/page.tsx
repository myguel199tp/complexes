/* eslint-disable @next/next/no-img-element */
export default function HolidayPage() {
  return (
    <main className="bg-stone-50 text-gray-900 overflow-hidden">
      {/* ================= HERO ELEGANTE ================= */}
      <section className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-32 text-center">
          <span className="inline-block mb-4 px-4 py-1 text-sm font-semibold text-amber-400 bg-amber-400/10 rounded-full">
            Uso exclusivo para miembros del club
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Gestión de
            <br />
            <span className="text-amber-400">alquiler vacacional interno</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300">
            Administra reservas internas, turnos y reglas de uso para estancias
            vacacionales dentro del club, con total control y transparencia.
          </p>

          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <button className="px-8 py-3 bg-amber-400 text-gray-900 font-semibold rounded-xl hover:bg-amber-300 transition">
              Ver disponibilidad
            </button>
            <button className="px-8 py-3 border border-white/20 rounded-xl hover:bg-white/5 transition">
              Conocer reglas
            </button>
          </div>
        </div>
      </section>

      {/* ================= BLOQUE CONCEPTO ================= */}
      <section className="relative -mt-20 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-14 border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              {/* TEXTO */}
              <div>
                <span className="inline-block mb-3 px-4 py-1 text-sm font-semibold text-amber-700 bg-amber-100 rounded-full">
                  Módulo vacacional interno
                </span>

                <h2 className="text-3xl font-extrabold">
                  Vacaciones organizadas, sin conflictos
                </h2>

                <p className="mt-4 text-gray-600 text-lg">
                  Un sistema pensado para comunidades privadas y clubes, donde
                  cada reserva cumple reglas internas y mantiene la equidad
                  entre miembros.
                </p>

                <ul className="mt-6 space-y-3 text-gray-700">
                  <li>✓ Reservas solo para miembros</li>
                  <li>✓ Control de cupos y turnos</li>
                  <li>✓ Reglas automáticas de uso</li>
                </ul>
              </div>

              {/* IMAGEN */}
              <div className="flex justify-center">
                <img
                  src="/pc-vacaciones.png"
                  alt="Gestión vacacional interna"
                  className="w-full max-w-sm rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= REGLAS ================= */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-20">
            Reglas claras para todos los miembros
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              [
                "📅",
                "Calendario regulado",
                "Disponibilidad definida según temporadas y turnos.",
              ],
              [
                "⚖️",
                "Equidad entre miembros",
                "Evita acaparamientos y conflictos por fechas.",
              ],
              [
                "🛡️",
                "Uso responsable",
                "Reglas automáticas para estadías y ocupación.",
              ],
            ].map(([icon, title, desc]) => (
              <div
                key={title}
                className="bg-stone-100 rounded-2xl p-8 text-center hover:shadow-md transition"
              >
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BENEFICIOS ================= */}
      <section className="py-28 bg-stone-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">
              Para la administración del club
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Control total del uso vacacional</li>
              <li>✓ Menos conflictos entre miembros</li>
              <li>✓ Cumplimiento de reglas internas</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Para los miembros</h2>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Reservas claras y transparentes</li>
              <li>✓ Acceso equitativo a fechas</li>
              <li>✓ Experiencia organizada</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 bg-amber-400 text-gray-900 text-center">
        <h2 className="text-4xl font-extrabold">
          Vacaciones internas, bien gestionadas
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-amber-900">
          Un sistema pensado para comunidades privadas y clubes exclusivos.
        </p>
        <button className="mt-8 px-10 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition">
          Solicitar demostración
        </button>
      </section>
    </main>
  );
}
