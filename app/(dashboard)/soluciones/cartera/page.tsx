"use client";
import { Title, Text } from "complexes-next-components";

/* eslint-disable @next/next/no-img-element */
export default function CarteraPage() {
  return (
    <main className="bg-gray-50 overflow-hidden">
      <section className="relative bg-gradient-to-br from-cyan-700 via-cyan-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center relative z-10">
          <Title className="text-4xl md:text-6xl font-extrabold leading-tight">
            Gestión inteligente de{" "}
            <span className="text-cyan-300">cartera y pagos</span>
          </Title>

          <Text className="mt-6 max-w-2xl mx-auto text-lg text-cyan-100">
            Controla ingresos, pagos y estados de cuenta del conjunto
            residencial desde un solo lugar, de forma clara y automatizada.
          </Text>
        </div>

        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-cyan-500/20 blur-3xl rounded-full" />
        </div>
      </section>

      <section className="relative -mt-24 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/30 p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block mb-3 px-4 py-1 text-sm font-semibold text-cyan-700 bg-cyan-100 rounded-full">
                  Módulo de cartera
                </span>

                <Text className="text-3xl font-extrabold text-gray-900">
                  Control financiero claro y en tiempo real
                </Text>

                <p className="mt-4 text-gray-600 text-lg">
                  Administra pagos, saldos pendientes y soportes de manera
                  organizada. Toda la información financiera del conjunto,
                  siempre actualizada y fácil de consultar.
                </p>

                <ul className="mt-6 space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-600 font-bold">✓</span>
                    Visualización de pagos realizados y pendientes
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-600 font-bold">✓</span>
                    Registro y validación de soportes de pago
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-600 font-bold">✓</span>
                    Estados de cuenta claros para residentes y administración
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <img
                  src="/pccartera.png"
                  alt="Panel de cartera y pagos"
                  className="
                    w-full
                    max-w-sm
                    rounded-2xl
                    shadow-xl
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Beneficios para la administración
              </h2>

              <div className="space-y-6">
                {[
                  [
                    "📊",
                    "Control financiero centralizado",
                    "Consulta ingresos, pagos y saldos sin hojas de cálculo dispersas.",
                  ],
                  [
                    "⏱️",
                    "Ahorro de tiempo operativo",
                    "Automatiza la revisión de pagos y reduce procesos manuales.",
                  ],
                  [
                    "📈",
                    "Mejor toma de decisiones",
                    "Información clara y actualizada para una gestión más eficiente.",
                  ],
                ].map(([icon, title, desc]) => (
                  <div
                    key={title}
                    className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
                  >
                    <h3 className="text-lg font-semibold flex items-center gap-3">
                      <span className="text-2xl">{icon}</span>
                      {title}
                    </h3>
                    <p className="mt-2 text-gray-600">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Beneficios para residentes
              </h2>

              <div className="space-y-6">
                {[
                  [
                    "💳",
                    "Pagos más simples",
                    "Consulta tu estado de cuenta y realiza pagos sin complicaciones.",
                  ],
                  [
                    "📄",
                    "Historial siempre disponible",
                    "Accede a tus pagos y soportes cuando lo necesites.",
                  ],
                  [
                    "🤝",
                    "Transparencia total",
                    "Información clara que genera confianza con la administración.",
                  ],
                ].map(([icon, title, desc]) => (
                  <div
                    key={title}
                    className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
                  >
                    <h3 className="text-lg font-semibold flex items-center gap-3">
                      <span className="text-2xl">{icon}</span>
                      {title}
                    </h3>
                    <p className="mt-2 text-gray-600">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-900 text-white text-center">
        <h2 className="text-4xl font-extrabold">
          Simplifica la gestión de tu cartera
        </h2>
        <p className="mt-4 text-slate-300 max-w-xl mx-auto">
          Control financiero claro, pagos organizados y mayor transparencia para
          tu conjunto residencial.
        </p>
      </section>
    </main>
  );
}
