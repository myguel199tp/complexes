/* eslint-disable @next/next/no-img-element */
export default function RegistroAlquileresPage() {
  return (
    <main className="bg-emerald-50 text-gray-900 overflow-hidden">
      {/* ================= HERO ================= */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6 py-28 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* TEXTO */}
          <div>
            <span className="inline-block mb-4 px-4 py-1 text-sm font-semibold text-emerald-700 bg-emerald-100 rounded-full">
              Control de alquileres externos
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Registro de alquileres
              <br />
              <span className="text-emerald-600">tipo Airbnb</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-xl">
              Registra estancias temporales, huéspedes y fechas de ingreso para
              mantener el control y cumplir las normas del conjunto.
            </p>

            <div className="mt-10 flex gap-4 flex-wrap">
              <button className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition">
                Solicitar demo
              </button>
              <button className="px-8 py-3 border border-emerald-300 rounded-xl hover:bg-emerald-100 transition">
                Ver cómo funciona
              </button>
            </div>
          </div>

          {/* VISUAL */}
          <div className="relative flex justify-center">
            <div className="absolute -inset-8 bg-emerald-300/40 blur-3xl rounded-full" />
            <img
              src="/pcalquileres.png"
              alt="Registro de alquileres externos"
              className="relative w-[280px] md:w-[320px] rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ================= TIMELINE ================= */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-20">
            Controla cada alquiler en pocos pasos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              [
                "🏠",
                "Registro",
                "El propietario informa el alquiler temporal.",
              ],
              ["👤", "Huéspedes", "Se registran los datos del huésped."],
              ["📅", "Fechas", "Ingreso y salida claramente definidos."],
              ["✅", "Control", "La administración valida el registro."],
            ].map(([icon, title, desc]) => (
              <div
                key={title}
                className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center hover:shadow-md transition"
              >
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TEXTO + IMAGEN ================= */}
      <section className="py-28 bg-emerald-100/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* TEXTO */}
          <div>
            <span className="inline-block mb-3 px-4 py-1 text-sm font-semibold text-emerald-700 bg-emerald-100 rounded-full">
              Módulo de alquileres
            </span>

            <h2 className="text-3xl font-extrabold">
              Flexibilidad para propietarios, control para la administración
            </h2>

            <p className="mt-4 text-gray-600 text-lg">
              Permite el alquiler temporal sin perder trazabilidad ni seguridad,
              manteniendo informada a la portería y a la administración.
            </p>

            <ul className="mt-6 space-y-3 text-gray-700">
              <li>✓ Registro de huéspedes</li>
              <li>✓ Control de fechas de estadía</li>
              <li>✓ Historial de alquileres</li>
            </ul>
          </div>

          {/* IMAGEN */}
          <div className="flex justify-center">
            <img
              src="/pc-alquileres-detalle.png"
              alt="Detalle de alquileres temporales"
              className="w-full max-w-sm rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* ================= BENEFICIOS ================= */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Para la administración</h2>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Mayor control de ingresos temporales</li>
              <li>✓ Cumplimiento del reglamento interno</li>
              <li>✓ Registro claro de visitantes</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Para propietarios</h2>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Registro simple y rápido</li>
              <li>✓ Autonomía para alquileres tipo Airbnb</li>
              <li>✓ Menos fricción con la administración</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 bg-emerald-600 text-white text-center">
        <h2 className="text-4xl font-extrabold">
          Controla los alquileres sin frenar la rentabilidad
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-emerald-100">
          Facilita los alquileres temporales y mantén la seguridad del conjunto.
        </p>
        <button className="mt-8 px-10 py-4 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-100 transition">
          Solicitar demostración
        </button>
      </section>
    </main>
  );
}
