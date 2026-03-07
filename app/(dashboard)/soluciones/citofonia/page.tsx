/* eslint-disable @next/next/no-img-element */
export default function CitofoniaPage() {
  return (
    <main className="bg-slate-950 text-white overflow-hidden">
      {/* ================= HERO SPLIT ================= */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* TEXTO */}
          <div>
            <span className="inline-block mb-4 px-4 py-1 text-sm font-semibold text-cyan-400 bg-cyan-400/10 rounded-full">
              Comunicación en tiempo real
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Citofonía virtual
              <br />
              <span className="text-cyan-400">sin cables ni equipos</span>
            </h1>

            <p className="mt-6 text-lg text-slate-300 max-w-xl">
              Atiende la portería desde tu celular, autoriza accesos y mantén la
              comunicación del conjunto activa estés donde estés.
            </p>

            <div className="mt-10 flex gap-4 flex-wrap">
              <button className="px-8 py-3 bg-cyan-400 text-slate-900 font-semibold rounded-xl hover:bg-cyan-300 transition">
                Solicitar demo
              </button>
              <button className="px-8 py-3 border border-white/20 rounded-xl hover:bg-white/5 transition">
                Ver flujo de llamadas
              </button>
            </div>
          </div>

          {/* VISUAL */}
          <div className="relative flex justify-center">
            <div className="absolute -inset-10 bg-cyan-500/20 blur-3xl rounded-full" />
            <img
              src="/phone-citofonia.png"
              alt="Citofonía virtual en celular"
              className="relative w-[260px] md:w-[300px] rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ================= FLUJO ================= */}
      <section className="relative py-28 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-20">
            ¿Cómo funciona la citofonía virtual?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              [
                "📞",
                "Llamada entrante",
                "La portería llama directamente al residente.",
              ],
              ["📱", "Atención inmediata", "Recibe la llamada en tu celular."],
              [
                "🔓",
                "Autorización",
                "Autoriza o rechaza el ingreso al instante.",
              ],
            ].map(([icon, title, desc], i) => (
              <div
                key={title}
                className="relative bg-white/5 border border-white/10 rounded-3xl p-8 text-center"
              >
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-slate-300">{desc}</p>

                {i < 2 && (
                  <span className="hidden md:block absolute top-1/2 -right-6 text-3xl text-cyan-400">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BENEFICIOS ================= */}
      <section className="py-28 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-8">Para la administración</h2>

            <ul className="space-y-4 text-slate-300">
              <li>✓ Menos costos operativos</li>
              <li>✓ Comunicación centralizada</li>
              <li>✓ Historial de mensajes</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Para residentes</h2>

            <ul className="space-y-4 text-slate-300">
              <li>✓ Atención desde cualquier lugar</li>
              <li>✓ Mayor seguridad</li>
              <li>✓ Comodidad total</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 bg-cyan-400 text-slate-900 text-center">
        <h2 className="text-4xl font-extrabold">
          Lleva la citofonía al siguiente nivel
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-slate-800">
          Reemplaza el citófono tradicional por una solución digital moderna.
        </p>
        <button className="mt-8 px-10 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition">
          Solicitar demostración
        </button>
      </section>
    </main>
  );
}
