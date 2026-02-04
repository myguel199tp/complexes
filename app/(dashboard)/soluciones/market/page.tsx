/* eslint-disable @next/next/no-img-element */
export default function MarketplacePage() {
  return (
    <main className="bg-neutral-100 text-gray-900">
      {/* ================= HERO ASIMÉTRICO ================= */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Texto */}
          <div>
            <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-black text-white">
              Nuevo módulo
            </span>

            <h1 className="text-5xl font-extrabold leading-tight">
              Marketplace
              <br />
              residencial
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-xl">
              Un espacio interno donde residentes y empresas del conjunto pueden
              ofrecer productos y servicios directamente a la comunidad.
            </p>

            <ul className="mt-8 space-y-3 text-gray-700">
              <li>✔ Impulsa la economía interna del conjunto</li>
              <li>✔ Visibilidad solo para residentes</li>
              <li>✔ Publicaciones simples y controladas</li>
            </ul>
          </div>

          {/* Mock visual */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border p-4 space-y-2">
                    <div className="h-16 bg-gray-200 rounded-md" />
                    <div className="h-3 bg-gray-300 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Elementos flotantes */}
            <div className="absolute -top-6 -right-6 bg-black text-white text-sm px-4 py-2 rounded-xl shadow-lg">
              Servicios locales
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white text-sm px-4 py-2 rounded-xl shadow-lg">
              Productos internos
            </div>
          </div>
        </div>
      </section>

      {/* ================= BLOQUE EXPLICATIVO ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            [
              "Publica",
              "Crea anuncios fácilmente",
              "Residentes y empresas registran sus servicios o productos en minutos.",
            ],
            [
              "Conecta",
              "Llega a tu comunidad",
              "Todo el contenido es visible solo dentro del conjunto.",
            ],
            [
              "Controla",
              "Gestión segura",
              "Administración con moderación y control del contenido.",
            ],
          ].map(([tag, title, desc]) => (
            <div key={title} className="space-y-3">
              <span className="text-xs uppercase text-gray-400">{tag}</span>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
