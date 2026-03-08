import { Megaphone, MessageCircle } from "lucide-react";

export default function ComunicacionesPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white overflow-hidden">
      {/* Fondo futurista */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,255,255,0.15),transparent_60%)]" />

      {/* Hero */}
      <section className="relative py-24 text-center px-6">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Centro de Comunicaciones
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-gray-300 text-lg">
          La administración puede mantener informados a todos los residentes
          mediante comunicados en la cartelera digital o mensajes directos a
          través del chat comunitario.
        </p>
      </section>

      {/* Cards futuristas */}
      <section className="relative max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Cartelera */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-40 group-hover:opacity-80 transition" />

            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <Megaphone className="w-10 h-10 text-cyan-400 mb-6" />

              <h2 className="text-2xl font-semibold mb-4">Cartelera digital</h2>

              <p className="text-gray-300 leading-relaxed">
                Publica comunicados importantes en la cartelera del conjunto.
                Los residentes podrán ver anuncios sobre asambleas,
                mantenimientos, pagos o novedades de la comunidad.
              </p>
            </div>
          </div>

          {/* Chat */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur opacity-40 group-hover:opacity-80 transition" />

            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <MessageCircle className="w-10 h-10 text-purple-400 mb-6" />

              <h2 className="text-2xl font-semibold mb-4">
                Chat con residentes
              </h2>

              <p className="text-gray-300 leading-relaxed">
                Envía mensajes directos a los residentes desde el chat
                comunitario. Ideal para notificaciones rápidas, avisos urgentes
                o comunicación directa con la comunidad.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
