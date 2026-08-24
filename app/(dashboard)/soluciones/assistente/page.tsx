"use client";
import { route } from "@/app/_domain/constants/routes";
import { Title, Text, Button } from "complexes-next-components";
import { useRouter } from "next/navigation";

/**
 * El asistente virtual, explicado a fondo.
 *
 * La página anterior era un placeholder y lo único que se decía del asistente
 * en el sitio era la línea de soporte ("resuelve dudas de uso"), que lo deja
 * como un chat de preguntas frecuentes. No lo es: responde con los datos reales
 * del conjunto, filtra cada respuesta por el rol de quien pregunta, ejecuta
 * flujos que crean registros y atiende el check-in de una emergencia.
 */

/** Las tres formas de conversar con él. */
const MODOS = [
  {
    icono: "⌨️",
    titulo: "Escribiendo",
    desc: "Lenguaje normal, sin comandos ni menús: “¿cuántos deben?”, “resumen del 302”, “crear multa”.",
  },
  {
    icono: "🎤",
    titulo: "Hablando",
    desc: "El micrófono transcribe lo que dictas y lo envía. Útil en portería, en ronda o con el celular en la mano.",
  },
  {
    icono: "🔊",
    titulo: "Escuchando",
    desc: "Cada respuesta se lee en voz alta en español, y se puede cortar el audio en cualquier momento.",
  },
];

/** Qué responde, agrupado por quién pregunta. */
const POR_ROL = [
  {
    icono: "🏠",
    titulo: "Residentes y propietarios",
    items: [
      "Cuánto debe, qué ha pagado y qué cuotas tiene pendientes",
      "Si su comprobante ya fue verificado o sigue en revisión",
      "Datos de su unidad: torre, apartamento y coeficiente",
      "Sus multas y sanciones",
      "Sus visitas y quién espera autorización de ingreso",
      "Sus inmuebles publicados y sus alojamientos vacacionales",
    ],
  },
  {
    icono: "🗂️",
    titulo: "Administración",
    items: [
      "Cartera y morosidad: cuántos deben, quiénes y cuánto",
      "Total recaudado, quién pagó y pagos de un apartamento puntual",
      "Bandeja de comprobantes por verificar",
      "Resumen completo de una unidad: “resumen del 302”",
      "Residentes: cuántos hay, quién vive dónde, búsqueda por nombre o correo",
      "Gastos y egresos del periodo",
      "Multas, comunicados, mantenimientos y asambleas",
      "Reuniones del consejo",
    ],
  },
  {
    icono: "🛡️",
    titulo: "Portería y operación",
    items: [
      "Quién está adentro y las visitas del día",
      "Búsqueda por placa de vehículo",
      "Accesos de invitados autorizados",
      "Rutas de entrega que ingresan al conjunto, con repartidor y pase de acceso",
      "El personal técnico ve solo los mantenimientos de su proveedor",
    ],
  },
  {
    icono: "🏘️",
    titulo: "Vida en comunidad",
    items: [
      "Áreas comunes, horarios y disponibilidad",
      "Actividades: piscina, gimnasio, yoga, clases y eventos",
      "Hilos del foro y últimas noticias del conjunto",
      "Peticiones y PQRS radicadas, con su estado",
      "Certificados y paz y salvo",
      "Comercios aliados, catálogo, sucursales y descuentos vigentes",
    ],
  },
];

/**
 * Los flujos que crean registros. Son conversaciones de varios turnos: el
 * asistente pregunta lo que falta, uno responde y al final queda el registro
 * creado, igual que si se hubiera llenado el formulario.
 */
const FLUJOS = [
  ["🧰", "Proveedores", "Alta de un proveedor nuevo del conjunto"],
  ["📢", "Comunicados", "Redactar y publicar una noticia o aviso"],
  ["🔧", "Mantenimientos", "Programar una revisión u orden de trabajo"],
  ["🚪", "Visitas", "Registrar un visitante y autorizar su ingreso"],
  ["⚖️", "Multas", "Imponer una sanción a una unidad"],
  ["💳", "Pagos", "Registrar un pago y subir el comprobante"],
  ["🏛️", "Asambleas", "Convocar una asamblea o reunión de propietarios"],
  ["💸", "Gastos", "Anotar un egreso o cargar una factura"],
  ["✅", "Tareas", "Crear y asignar una tarea al personal"],
];

/** Cómo entiende, más allá de la lista de temas. */
const CONVERSACION = [
  [
    "🌎",
    "Tres idiomas, sin configurar nada",
    "Detecta por el propio mensaje si se le habla en español, inglés o portugués, y responde en el mismo idioma.",
  ],
  [
    "🧭",
    "Sabe explicarse",
    "“¿Qué puedes hacer?” devuelve un resumen corto y filtrado por el rol de quien pregunta; “ver todo” abre el listado completo.",
  ],
  [
    "💡",
    "Cuando no entiende, propone",
    "En vez de responder “no entendí” y morir ahí, sugiere las frases más parecidas que sí sabe resolver.",
  ],
  [
    "📚",
    "Aprende de lo que falló",
    "Cada mensaje que no logró interpretar queda guardado, y de ahí salen las mejoras del siguiente ciclo.",
  ],
  [
    "📋",
    "Texto o tabla",
    "La misma pregunta se responde en prosa o como tabla, con un botón para copiarla y pegarla en una hoja de cálculo.",
  ],
  [
    "⏰",
    "Recordatorios",
    "“Recuérdame cobrarle al 302 el lunes” queda agendado y el aviso sale solo a la hora fijada.",
  ],
];

/** Lo que cambia según el rol: no es cosmética, es el alcance del dato. */
const PERMISOS = [
  "Un propietario pregunta “¿cuánto debo?” y recibe su saldo; el administrador pregunta lo mismo y recibe la cartera del conjunto",
  "Los datos financieros del conjunto —gastos, egresos, recaudo total— no se abren a residentes",
  "El personal de mantenimiento ve los registros de su proveedor, no los de todos",
  "Portería ve las visitas y las entregas que entran; no ve la cartera",
  "Los pedidos de un residente los ve solo él: la administración los ve sin dirección ni datos de contacto",
  "Un propietario no puede consultar el maestro de proveedores",
];

export default function AssistentePage() {
  const router = useRouter();

  return (
    <main className="bg-gray-50 overflow-hidden">
      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center relative z-10">
          <span className="inline-block mb-5 px-4 py-1 text-sm font-semibold text-indigo-200 bg-indigo-400/10 rounded-full">
            Asistente virtual con IA
          </span>

          <Title className="text-4xl md:text-6xl font-extrabold leading-tight">
            Pregúntale al conjunto,{" "}
            <span className="text-indigo-300">y respóndete solo</span>
          </Title>

          <Text className="mt-6 max-w-2xl mx-auto text-lg text-indigo-100">
            No es un chat de preguntas frecuentes. Consulta los datos reales de
            la copropiedad, responde según el rol de quien pregunta y ejecuta lo
            que se le pide: crear una multa, publicar un comunicado o registrar
            un pago, conversando.
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
          <div className="w-[600px] h-[600px] bg-indigo-500/20 blur-3xl rounded-full" />
        </div>
      </section>

      {/* ================= PANEL + CHAT DE EJEMPLO ================= */}
      <section className="relative -mt-24 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/30 p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block mb-3 px-4 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                  Datos reales, no respuestas genéricas
                </span>

                <Text className="text-3xl font-extrabold text-gray-900">
                  La diferencia entre explicar dónde está el dato y darlo
                </Text>

                <Text className="mt-4 text-gray-600 text-lg">
                  Un chatbot común responde “esa información está en el módulo
                  de cartera”. Este consulta la cartera del conjunto en el
                  momento y devuelve la cifra, con el nombre de la unidad y su
                  saldo, en texto o en una tabla lista para copiar.
                </Text>

                <ul className="mt-6 space-y-3 text-gray-700">
                  {[
                    "Consulta en vivo sobre la información del conjunto",
                    "Cada respuesta filtrada por el rol de quien pregunta",
                    "Escribe, dicta por micrófono o escucha la respuesta",
                    "Español, inglés y portugués, detectados solos",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-indigo-600 font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Conversación de muestra */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-700/60">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg">
                    🤖
                  </div>
                  <div>
                    <Text size="sm" font="semi" colVariant="on" className="leading-tight">
                      Asistente IA
                    </Text>
                    <Text size="xs" className="text-emerald-400 leading-tight">
                      En línea
                    </Text>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex justify-end">
                    <Text size="sm" colVariant="on" className="max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2.5">
                      ¿cuántos deben?
                    </Text>
                  </div>

                  <div className="flex justify-start">
                    <Text size="sm" className="max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-800 border border-slate-700/50 px-4 py-2.5 text-slate-100">
                      14 unidades con saldo pendiente, $18.740.000 en total. 6
                      pasan de 90 días.
                    </Text>
                  </div>

                  <div className="flex justify-end">
                    <Text size="sm" colVariant="on" className="max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2.5">
                      resumen del 302
                    </Text>
                  </div>

                  <div className="flex justify-start">
                    <Text size="sm" className="max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-800 border border-slate-700/50 px-4 py-2.5 text-slate-100">
                      Torre B – 302. Residentes, saldo, multas y últimas visitas
                      de la unidad.
                    </Text>
                  </div>

                  <div className="flex justify-end">
                    <Text size="sm" colVariant="on" className="max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2.5">
                      crear multa
                    </Text>
                  </div>

                  <div className="flex justify-start">
                    <Text size="sm" className="max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-800 border border-slate-700/50 px-4 py-2.5 text-slate-100">
                      Listo, vamos por partes. ¿A qué unidad se le aplica?
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MODOS ================= */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <Title as="h2" size="sm" font="bold" className="md:text-4xl font-extrabold text-gray-900 text-center">
            Se le habla como a una persona
          </Title>

          <Text size="sm" className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
            Sin comandos que memorizar, sin menús que recorrer y sin una
            sintaxis exacta que respetar. Se pregunta y ya.
          </Text>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {MODOS.map((modo) => (
              <div
                key={modo.titulo}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-lg transition"
              >
                <span className="text-4xl">{modo.icono}</span>
                <Text as="h3" size="md" font="bold" className="mt-4 text-gray-900">
                  {modo.titulo}
                </Text>
                <Text size="sm" className="mt-2 text-gray-600 leading-relaxed">
                  {modo.desc}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= QUÉ RESPONDE ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Title as="h2" size="sm" font="bold" className="md:text-4xl font-extrabold text-gray-900 text-center">
            Todo lo que sabe responder
          </Title>

          <Text size="sm" className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
            El asistente está conectado con los módulos del conjunto, así que la
            misma conversación cruza cartera, portería, mantenimiento y
            comunidad sin cambiar de pantalla.
          </Text>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            {POR_ROL.map((bloque) => (
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
                      <span className="text-indigo-600 font-bold shrink-0">
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

      {/* ================= FLUJOS QUE CREAN ================= */}
      <section className="py-28 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <span className="inline-block mb-4 px-4 py-1 text-sm font-semibold text-indigo-300 bg-indigo-400/10 rounded-full">
              No solo consulta
            </span>

            <Title as="h2" size="sm" font="bold" className="md:text-4xl font-extrabold">
              También hace el trabajo
            </Title>

            <Text size="sm" className="mt-4 text-slate-300 max-w-2xl mx-auto">
              Nueve procesos completos se pueden ejecutar conversando. El
              asistente va pidiendo lo que falta, un dato por turno, y al final
              el registro queda creado igual que si se hubiera llenado el
              formulario.
            </Text>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FLUJOS.map(([icono, titulo, desc]) => (
              <div
                key={titulo}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 hover:bg-white/[0.07] transition"
              >
                <span className="text-3xl">{icono}</span>
                <Text as="h3" font="semi" className="mt-3 text-lg">{titulo}</Text>
                <Text size="sm" className="mt-1.5 text-slate-300 leading-relaxed">
                  {desc}
                </Text>
              </div>
            ))}
          </div>

          <Text size="sm" className="mt-10 text-center text-slate-400 max-w-2xl mx-auto">
            Si a mitad de camino falta un dato, la conversación se retoma donde
            quedó: no hay que empezar de nuevo.
          </Text>
        </div>
      </section>

      {/* ================= CÓMO CONVERSA ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <Title as="h2" size="sm" font="bold" className="md:text-4xl font-extrabold text-gray-900 text-center mb-16">
            Cómo conversa
          </Title>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONVERSACION.map(([icono, titulo, desc]) => (
              <div
                key={titulo}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition"
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

      {/* ================= PERMISOS ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block mb-3 px-4 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                Privacidad
              </span>

              <Title as="h2" size="sm" font="bold" className="font-extrabold text-gray-900">
                La misma pregunta, distinta respuesta
              </Title>

              <Text size="sm" className="mt-4 text-gray-600 leading-relaxed">
                El rol de quien escribe no cambia solo lo que ve en pantalla:
                cambia lo que el asistente le contesta. Cada consulta se filtra
                antes de responder, así que nadie obtiene por chat un dato al
                que no tendría acceso entrando al módulo.
              </Text>
            </div>

            <ul className="space-y-4">
              {PERMISOS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <span className="text-indigo-600 font-bold shrink-0">🔒</span>
                  <span className="text-[15px] text-gray-700 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ================= EMERGENCIAS ================= */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-3xl border-2 border-red-100 bg-red-50/60 p-8 md:p-10">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              <Text as="h3" size="lg" font="bold" className="text-gray-900">
                En una emergencia, el asistente cambia de trabajo
              </Text>
            </div>

            <Text size="sm" className="mt-4 text-gray-700 leading-relaxed">
              Cuando el conjunto activa una emergencia, el chat deja de ser un
              buscador y pasa a hacer el censo: pregunta a cada residente si
              está bien, si necesita ayuda, si hay heridos, si hay personas
              vulnerables en la unidad, si puede evacuar y si detecta riesgos.
              Las respuestas alimentan la lista que usa portería para saber a
              qué puerta ir primero.
            </Text>

            <Text size="sm" className="mt-4 text-gray-700 leading-relaxed">
              Ese check-in tiene prioridad sobre todo lo demás y no depende del
              plan contratado ni del cupo de consultas: una verificación de
              seguridad no se bloquea nunca.
            </Text>
          </div>
        </div>
      </section>

      {/* ================= LÍMITES / ALCANCE ================= */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-3xl border-2 border-indigo-100 bg-indigo-50/60 p-8 md:p-10">
            <Text as="h3" size="lg" font="bold" className="text-gray-900">
              El conjunto decide. El asistente ejecuta y registra.
            </Text>

            <Text size="sm" className="mt-4 text-gray-700 leading-relaxed">
              El asistente no aprueba pagos por su cuenta, no condona deudas, no
              escala un caso a cobro jurídico ni toma decisiones que le
              corresponden a la administración o al consejo. Lo que hace es
              responder con el dato correcto y ejecutar lo que se le pide, con
              el usuario que lo pidió y la fecha en que ocurrió.
            </Text>

            <Text size="sm" className="mt-4 text-gray-700 leading-relaxed">
              El acceso al asistente y el cupo mensual de consultas dependen del
              plan contratado por el conjunto, y el propio asistente avisa
              cuando se está llegando al límite.
            </Text>
          </div>
        </div>
      </section>

      {/* ================= BENEFICIOS ================= */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <Title as="h2" size="sm" font="bold" className="text-gray-900 mb-8">
                Para la administración
              </Title>

              <div className="space-y-6">
                {[
                  [
                    "📞",
                    "Menos preguntas repetidas",
                    "El “¿cuánto debo?” y el “¿ya me verificaron el pago?” los responde el chat, no la oficina.",
                  ],
                  [
                    "⚡",
                    "Consultas en segundos",
                    "La cartera, el recaudo o el resumen de una unidad salen de una frase, sin armar reportes.",
                  ],
                  [
                    "📋",
                    "Datos listos para usar",
                    "Cualquier respuesta se puede pedir en tabla y copiar directo a una hoja de cálculo.",
                  ],
                  [
                    "🕐",
                    "Disponible siempre",
                    "Un domingo a las 11 de la noche el residente igual obtiene su respuesta.",
                  ],
                ].map(([icon, title, desc]) => (
                  <div
                    key={title}
                    className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition"
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
                    "🙋",
                    "No hay que aprender la app",
                    "Se pregunta en español corriente y el asistente lleva al dato o hace el trámite.",
                  ],
                  [
                    "💬",
                    "Sin esperar a que contesten",
                    "Nada de ir a la oficina en horario de atención para saber cuánto debe.",
                  ],
                  [
                    "🎙️",
                    "También por voz",
                    "Se dicta la pregunta y se escucha la respuesta, sin escribir una letra.",
                  ],
                  [
                    "🌎",
                    "En su idioma",
                    "Responde en español, inglés o portugués según cómo se le escriba.",
                  ],
                ].map(([icon, title, desc]) => (
                  <div
                    key={title}
                    className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition"
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
            Ponle un asistente al conjunto
          </Title>

          <Text size="sm" className="mt-4 text-slate-300">
            Que responda lo que hoy responde la oficina, y que haga lo que hoy
            toca hacer a mano.
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
