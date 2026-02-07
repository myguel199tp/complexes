"use client";

export default function NewsPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* HERO */}
      <section className="relative py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/40 via-blue-500/30 to-indigo-600/40 blur-3xl" />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Centro de Noticias ComplexesPH
          </h1>
          <p className="mt-6 text-lg text-gray-700">
            Actualizaciones del club e información clave para la gestión
            residencial.
          </p>
        </div>
      </section>

      {/* CLUB - SCROLL HORIZONTAL */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Actualizaciones del Club
            </h2>
            <p className="text-sm text-gray-500">
              Evolución de la plataforma y del ecosistema
            </p>
          </div>
          <span className="text-sm font-semibold text-cyan-600">Desliza →</span>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 pr-4">
          {clubNews.map((item, index) => (
            <div
              key={index}
              className="min-w-[320px] bg-white rounded-2xl shadow-xl hover:shadow-2xl transition"
            >
              <div className="h-36 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-t-2xl" />

              <div className="p-6">
                <span className="text-xs uppercase font-semibold text-cyan-600">
                  {item.tag}
                </span>
                <h3 className="mt-2 font-bold text-gray-800">{item.title}</h3>
                <p className="mt-3 text-sm text-gray-600">{item.description}</p>
                <p className="mt-4 text-xs text-gray-400">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LEGAL - TIMELINE VERTICAL */}
      <section className="max-w-7xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Información Normativa
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            Referencias legales y cambios regulatorios
          </p>
        </div>

        <div className="md:col-span-2 max-h-[420px] overflow-y-auto relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-indigo-200" />

          {legalNews.map((item, index) => (
            <div key={index} className="relative mb-8">
              <div className="absolute -left-[6px] top-2 w-3 h-3 bg-indigo-600 rounded-full" />

              <div className="bg-white rounded-xl shadow-md p-6 ml-4">
                <h4 className="font-semibold text-gray-800">{item.title}</h4>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                <p className="mt-3 text-xs text-gray-400">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* DATA */

const clubNews = [
  {
    tag: "Actualización",
    title: "Nueva versión del módulo de comunicaciones",
    description:
      "Mejoras en anuncios internos, notificaciones y segmentación por roles.",
    date: "25 Marzo 2026",
  },
  {
    tag: "Ecosistema",
    title: "Expansión del club a nuevas ciudades",
    description:
      "Más conjuntos comienzan a operar dentro de la red ComplexesPH.",
    date: "18 Marzo 2026",
  },
  {
    tag: "Alianzas",
    title: "Inicio del programa de convenios estratégicos",
    description:
      "Se integran proveedores de servicios al ecosistema residencial.",
    date: "10 Marzo 2026",
  },
  {
    tag: "Plataforma",
    title: "Optimización general del sistema",
    description: "Mejoras de rendimiento y estabilidad en toda la plataforma.",
    date: "02 Marzo 2026",
  },
];

const legalNews = [
  {
    title: "Actualización sobre asambleas virtuales",
    description:
      "Nuevos lineamientos legales para la realización de asambleas no presenciales.",
    date: "22 Marzo 2026",
  },
  {
    title: "Cambios en la normativa de propiedad horizontal",
    description:
      "Ajustes aplicables a la administración financiera y operativa.",
    date: "12 Marzo 2026",
  },
  {
    title: "Protección de datos personales",
    description: "Recomendaciones para el manejo de información sensible.",
    date: "03 Marzo 2026",
  },
  {
    title: "Responsabilidades del administrador",
    description: "Recordatorio sobre obligaciones legales vigentes.",
    date: "18 Febrero 2026",
  },
];
