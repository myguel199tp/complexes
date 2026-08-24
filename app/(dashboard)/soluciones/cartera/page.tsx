"use client";
import { route } from "@/app/_domain/constants/routes";
import { Title, Text, Button } from "complexes-next-components";
import { useRouter } from "next/navigation";

/* eslint-disable @next/next/no-img-element */

/**
 * El ciclo de la cartera, de la generación al cobro jurídico.
 *
 * La página anterior se quedaba en "ver pagos y registrar soportes", que era el
 * módulo de hace varias versiones: no mencionaba abonos parciales, recibos de
 * caja, intereses de mora, antigüedad ni gestión de cobro.
 */
const CICLO = [
  {
    paso: "01",
    titulo: "Se genera",
    desc: "Una cuota por unidad, con el coeficiente de copropiedad validado antes de emitir.",
  },
  {
    paso: "02",
    titulo: "Se paga",
    desc: "El residente sube su comprobante o reporta la referencia bancaria desde el celular.",
  },
  {
    paso: "03",
    titulo: "Se verifica",
    desc: "La administración confirma el monto contra el extracto y emite el recibo de caja.",
  },
  {
    paso: "04",
    titulo: "Se cobra",
    desc: "Avisos antes del vencimiento, intereses de mora y gestión sobre los tramos vencidos.",
  },
  {
    paso: "05",
    titulo: "Se escala",
    desc: "Si nada de lo anterior funciona, el conjunto traslada la unidad a cobro jurídico.",
  },
];

const BLOQUES = [
  {
    icono: "🧾",
    titulo: "Facturación",
    items: [
      "Una cuota por unidad, no por residente",
      "Coeficientes de copropiedad validados al 100% antes de generar",
      "Mensual, trimestral o por meses específicos",
      "Administración, extraordinarias, fondo de reserva, parqueadero, multas y saldos iniciales",
      "Tarifa de parqueadero por hora, conectada con citofonía",
    ],
  },
  {
    icono: "💳",
    titulo: "Recaudo",
    items: [
      "Comprobante en PDF o foto, o número de transacción",
      "Abonos parciales: cada pago con su propio soporte y su verificación",
      "Puede pagar el titular o cualquier residente de la unidad",
      "Bandeja única de comprobantes por revisar",
      "Recibo de caja numerado, consecutivo por conjunto y año",
      "Rechazo con motivo, y el residente puede corregir y reenviar",
    ],
  },
  {
    icono: "📈",
    titulo: "Cobranza",
    items: [
      "Aviso antes del vencimiento, con los días que fije el conjunto",
      "Marcado automático de cuotas vencidas",
      "Intereses de mora con la tasa del reglamento, prorrateados por días reales",
      "Cartera por edades: hasta 30, 60, 90, 120 y más días",
      "Recordatorios de cobro individuales o masivos por tramo",
      "Estado de cuenta por unidad y exportación a CSV",
    ],
  },
  {
    icono: "⚖️",
    titulo: "Cobro jurídico",
    items: [
      "La cartera sugiere candidatas según el corte que fije el conjunto",
      "Traslado manual, con motivo obligatorio que queda en el expediente",
      "Deuda y antigüedad congeladas el día del traslado",
      "Etapas prejurídico, jurídico y demandado, con abogado y radicado",
      "Un solo expediente abierto por unidad",
      "Cierre con motivo: pago, desistimiento, incobrable o error",
    ],
  },
];

const TRANSVERSAL = [
  [
    "🔔",
    "Notificaciones",
    "Cada movimiento avisa a quien corresponde: al residente cuando su pago se aprueba o su cuota vence, y a la administración cuando entra un comprobante.",
  ],
  [
    "🗂️",
    "Bitácora completa",
    "Quién asignó una cuota, quién aprobó un abono que no cuadraba y quién escaló una unidad. Nada se sobrescribe.",
  ],
  [
    "📄",
    "Paz y salvo confiable",
    "El certificado consulta la cartera antes de emitirse: una unidad con saldo pendiente no puede sacarlo.",
  ],
  [
    "📱",
    "Web y celular",
    "Residentes y administración trabajan desde ambos: subir un comprobante, verificarlo o revisar la cartera.",
  ],
];

export default function CarteraPage() {
  const router = useRouter();

  return (
    <main className="bg-gray-50 overflow-hidden">
      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-cyan-700 via-cyan-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center relative z-10">
          <span className="inline-block mb-5 px-4 py-1 text-sm font-semibold text-cyan-300 bg-cyan-400/10 rounded-full">
            Módulo de cartera y pagos
          </span>

          <Title className="text-4xl md:text-6xl font-extrabold leading-tight">
            De la cuota generada al{" "}
            <span className="text-cyan-300">peso recaudado</span>
          </Title>

          <Text className="mt-6 max-w-2xl mx-auto text-lg text-cyan-100">
            Todo el ciclo de la cartera del conjunto en un solo lugar: emisión,
            recaudo con soporte verificado, intereses de mora, gestión de cobro
            y expediente jurídico cuando hace falta.
          </Text>

          <div className="mt-8 flex justify-center">
            <Button
              colVariant="success"
              onClick={() => router.push(route.demost)}
              rounded="lg"
            >
              Solicitar demostración
            </Button>
          </div>
        </div>

        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-cyan-500/20 blur-3xl rounded-full" />
        </div>
      </section>

      {/* ================= PANEL ================= */}
      <section className="relative -mt-24 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/30 p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block mb-3 px-4 py-1 text-sm font-semibold text-cyan-700 bg-cyan-100 rounded-full">
                  Control financiero
                </span>

                <Text className="text-3xl font-extrabold text-gray-900">
                  Saber cuánto entra, cuánto falta y desde cuándo
                </Text>

                <Text className="mt-4 text-gray-600 text-lg">
                  La deuda se mide por saldo real, no por monto emitido: una
                  cuota abonada a medias debe lo que queda. Y la antigüedad se
                  calcula sola, que es lo que decide a quién cobrar primero.
                </Text>

                <ul className="mt-6 space-y-3 text-gray-700">
                  {[
                    "Saldo por unidad, con abonos parciales descontados",
                    "Antigüedad de la deuda por tramos",
                    "Comprobantes verificados y recibos de caja numerados",
                    "Intereses de mora según el reglamento del conjunto",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-cyan-600 font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-center">
                <img
                  src="/pccartera.png"
                  alt="Panel de cartera y pagos"
                  className="w-full max-w-sm rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EL CICLO ================= */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <Title as="h2" size="sm" font="bold" className="md:text-4xl font-extrabold text-gray-900 text-center">
            El ciclo completo
          </Title>

          <Text size="sm" className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
            Cada paso deja registro del anterior, así que en cualquier momento
            se puede responder qué pasó con una cuota y quién lo decidió.
          </Text>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {CICLO.map((etapa) => (
              <div
                key={etapa.paso}
                className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition"
              >
                <span className="text-sm font-bold text-cyan-600">
                  {etapa.paso}
                </span>

                <Text as="h3" font="bold" className="mt-2 text-lg text-gray-900">
                  {etapa.titulo}
                </Text>

                <Text size="sm" className="mt-2 text-gray-600 leading-relaxed">
                  {etapa.desc}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BLOQUES ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Title as="h2" size="sm" font="bold" className="md:text-4xl font-extrabold text-gray-900 text-center">
            Todo lo que incluye
          </Title>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            {BLOQUES.map((bloque) => (
              <div
                key={bloque.titulo}
                className="rounded-3xl border border-gray-100 bg-gray-50 p-8 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{bloque.icono}</span>
                  <Text as="h3" size="lg" font="bold" className="text-gray-900">
                    {bloque.titulo}
                  </Text>
                </div>

                <ul className="mt-6 space-y-3">
                  {bloque.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <span className="text-cyan-600 font-bold shrink-0">
                        ✓
                      </span>
                      <span className="text-[15px] leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= QUIÉN DECIDE ================= */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-3xl border-2 border-cyan-100 bg-cyan-50/60 p-8 md:p-10">
            <Text as="h3" size="lg" font="bold" className="text-gray-900">
              El conjunto decide. La plataforma registra.
            </Text>

            <Text size="sm" className="mt-4 text-gray-700 leading-relaxed">
              SMARTPH no realiza cobros de cartera, no asume la deuda del
              conjunto y no actúa como entidad de cobranza. Generar la cartera,
              aprobar un pago, insistirle a un moroso o trasladar una unidad a
              cobro jurídico son decisiones de la administración: no hay ningún
              proceso automático que escale un caso.
            </Text>

            <Text size="sm" className="mt-4 text-gray-700 leading-relaxed">
              Lo que aporta la plataforma es que cada una de esas decisiones
              quede ejecutada, notificada a quien corresponde y registrada con
              su fecha, su responsable y su motivo.
            </Text>
          </div>
        </div>
      </section>

      {/* ================= TRANSVERSAL ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Title as="h2" size="sm" font="bold" className="md:text-4xl font-extrabold text-gray-900 text-center mb-16">
            Además, en todo el módulo
          </Title>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRANSVERSAL.map(([icono, titulo, desc]) => (
              <div
                key={titulo}
                className="bg-gray-50 rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition"
              >
                <span className="text-3xl">{icono}</span>
                <Text as="h3" font="semi" className="mt-3 text-lg text-gray-900">
                  {titulo}
                </Text>
                <Text size="sm" className="mt-2 text-gray-600 leading-relaxed">
                  {desc}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BENEFICIOS ================= */}
      <section className="py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <Title as="h2" size="sm" font="bold" className="text-gray-900 mb-8">
                Para la administración
              </Title>

              <div className="space-y-6">
                {[
                  [
                    "📊",
                    "La cartera en una pantalla",
                    "Quién debe, cuánto y desde hace cuánto, sin hojas de cálculo dispersas ni sumas a mano.",
                  ],
                  [
                    "⏱️",
                    "Menos trabajo manual",
                    "Las cuotas se generan solas, las vencidas se marcan solas y los recibos se numeran solos.",
                  ],
                  [
                    "🛡️",
                    "Respaldo de cada decisión",
                    "Si un residente discute un cobro, la bitácora dice qué se le envió, cuándo y quién lo aprobó.",
                  ],
                  [
                    "🎯",
                    "Cobro por prioridad",
                    "Los tramos de antigüedad muestran a quién insistirle primero y a quién ya toca escalar.",
                  ],
                ].map(([icon, title, desc]) => (
                  <div
                    key={title}
                    className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
                  >
                    <Text as="h3" font="semi" className="text-lg flex items-center gap-3">
                      <span className="text-2xl">{icon}</span>
                      {title}
                    </Text>
                    <Text size="sm" className="mt-2 text-gray-600">{desc}</Text>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Title as="h2" size="sm" font="bold" className="text-gray-900 mb-8">
                Para los residentes
              </Title>

              <div className="space-y-6">
                {[
                  [
                    "💳",
                    "Pagar sin vueltas",
                    "Consulta el saldo, mira a qué cuenta consignar y sube el comprobante desde el celular.",
                  ],
                  [
                    "🧾",
                    "Su recibo, siempre a la mano",
                    "Cada pago verificado emite un recibo de caja numerado que se puede descargar cuando sea.",
                  ],
                  [
                    "🤝",
                    "Poder abonar por partes",
                    "Un acuerdo informal deja de ser un problema: cada abono se registra y descuenta del saldo.",
                  ],
                  [
                    "👁️",
                    "Saber en qué va",
                    "El estado dice si el comprobante está en revisión, aprobado o si hay que corregir algo.",
                  ],
                ].map(([icon, title, desc]) => (
                  <div
                    key={title}
                    className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
                  >
                    <Text as="h3" font="semi" className="text-lg flex items-center gap-3">
                      <span className="text-2xl">{icon}</span>
                      {title}
                    </Text>
                    <Text size="sm" className="mt-2 text-gray-600">{desc}</Text>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <Title as="h2" size="md" font="bold" className="font-extrabold">
            Simplifica la gestión de tu cartera
          </Title>

          <Text size="sm" className="mt-4 text-slate-300">
            Recaudo con soporte verificado, cobranza con criterio y un
            expediente por cada unidad que hubo que escalar.
          </Text>

          <div className="mt-8 flex justify-center">
            <Button
              colVariant="success"
              onClick={() => router.push(route.demost)}
              rounded="lg"
            >
              Solicitar demostración
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
