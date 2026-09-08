/**
 * Guión del asistente de WhatsApp.
 *
 * Antes había dos botones sueltos —"Hablar con un asesor" en la landing de
 * comercios y "quiero una demostración" en la portada y en la demo— que abrían
 * WhatsApp a ciegas: al asesor le llegaba un "Hola" sin saber si escribía un
 * administrador o un tendero, y el visitante se iba sin resolver la única duda
 * que le impedía avanzar. Aquí ese paso ocurre antes de salir del sitio: el
 * asistente pregunta con quién habla, responde lo frecuente con texto ya
 * redactado y recién entonces abre WhatsApp con el contexto dentro del mensaje.
 *
 * El guión está en español, igual que la landing de comercios. Si más adelante
 * se traduce, este archivo es el único que hay que tocar.
 */

export type Audience = "conjunto" | "comercio";

export interface Faq {
  id: string;
  /** Texto del chip y de la burbuja que queda como si la escribiera el visitante. */
  pregunta: string;
  respuesta: string;
  /** Palabras (sin tildes, en minúscula) que disparan esta respuesta al escribir libre. */
  keywords: string[];
}

/** Números de los asesores. Se reparte al azar para no cargar siempre al mismo. */
export const ADVISORS = [
  "573003066369",
  "573246829832",
  "573007908880",
  "573044156317",
] as const;

export const AUDIENCE_LABEL: Record<Audience, string> = {
  conjunto: "Administro un conjunto",
  comercio: "Tengo un comercio",
};

/** Cómo se presenta el visitante dentro del mensaje que le llega al asesor. */
export const AUDIENCE_SELF: Record<Audience, string> = {
  conjunto: "administro un conjunto residencial",
  comercio: "tengo un comercio y quiero venderle a los conjuntos",
};

export const GREETING =
  "¡Hola! 👋 Soy el asistente de globaliaph. Te resuelvo las dudas de una vez y, si quieres, te paso con un asesor por WhatsApp.";

export const AUDIENCE_QUESTION =
  "Para darte los datos que sí te sirven: ¿administras un conjunto o tienes un comercio?";

export const AUDIENCE_INTRO: Record<Audience, string> = {
  conjunto:
    "Perfecto. globaliaph reúne en una sola plataforma la administración del conjunto: cartera, comunicados, reservas, correspondencia, citofonía virtual y control de ingreso. Elige una pregunta o escríbeme la tuya.",
  comercio:
    "Perfecto. Con globaliaph tu negocio le vende directo a los conjuntos: contratos B2B con la administración, catálogo y pedidos de los residentes, y QR de ingreso para tu domiciliario. Elige una pregunta o escríbeme la tuya.",
};

/** Cuando no entendemos lo que escribió, no lo dejamos sin salida. */
export const FALLBACK =
  "Eso prefiero que te lo confirme un asesor con tu caso puntual. Te lo paso por WhatsApp con lo que ya me contaste.";

export const CTA_LABEL = "Hablar con un asesor por WhatsApp";

export const FAQS: Record<Audience, Faq[]> = {
  conjunto: [
    {
      id: "incluye",
      pregunta: "¿Qué incluye la plataforma?",
      respuesta:
        "Cartera y pagos con recibo, comunicados y votaciones, reserva de zonas comunes, correspondencia, PQRS, citofonía virtual, control de ingreso con QR para visitantes y domiciliarios, y el directorio de comercios aliados. Todo entra con el mismo plan: no se cobra por módulo.",
      keywords: ["incluye", "modulos", "funciones", "sirve", "hace", "que es"],
    },
    {
      id: "precio",
      pregunta: "¿Cuánto cuesta?",
      respuesta:
        "El precio va por número de inmuebles, no por usuario. En la página de demostración pones cuántos apartamentos tiene el conjunto y te calcula el valor por unidad al instante; desde ahí mismo dejas tus datos.",
      keywords: [
        "precio",
        "cuesta",
        "vale",
        "costo",
        "planes",
        "tarifa",
        "pago",
        "mensualidad",
      ],
    },
    {
      id: "demo",
      pregunta: "Quiero ver una demostración",
      respuesta:
        "Es una llamada de unos 30 minutos donde te mostramos la plataforma con datos parecidos a los de tu conjunto. Dinos tu horario y la agendamos por WhatsApp.",
      keywords: [
        "demo",
        "demostracion",
        "reunion",
        "agendar",
        "cita",
        "prueba",
        "ver",
      ],
    },
    {
      id: "implementacion",
      pregunta: "¿Cuánto tarda la implementación?",
      respuesta:
        "Cargar el conjunto, las unidades y los residentes toma pocos días. Migramos la base que ya tengas en Excel y acompañamos las primeras semanas para que el consejo y los residentes entren sin tropiezos.",
      keywords: [
        "implementacion",
        "instalar",
        "migrar",
        "migracion",
        "demora",
        "tarda",
        "tiempo",
        "excel",
      ],
    },
    {
      id: "tamano",
      pregunta: "¿Sirve para un conjunto pequeño?",
      respuesta:
        "Sí. Funciona igual con 20 o con 600 unidades; lo único que cambia es el valor, porque se calcula por inmueble.",
      keywords: [
        "pequeno",
        "pequeño",
        "chico",
        "unidades",
        "apartamentos",
        "torres",
        "casas",
      ],
    },
  ],
  comercio: [
    {
      id: "a-quien",
      pregunta: "¿A quién le voy a vender?",
      respuesta:
        "A dos clientes distintos: a la administración, con contratos B2B para servicios recurrentes (aseo, jardinería, mantenimiento), y a los residentes, con tu catálogo dentro de la app del conjunto. Ya no dependes de dejar la cotización en portería.",
      keywords: [
        "vender",
        "clientes",
        "quien",
        "conjuntos",
        "b2b",
        "administracion",
        "contrato",
      ],
    },
    {
      id: "domiciliario",
      pregunta: "¿Cómo entra mi domiciliario?",
      respuesta:
        "Cada pedido genera un QR de ingreso. El domiciliario lo muestra en portería, el vigilante lo escanea y entra sin tener que llamar al apartamento. Queda registro de quién entró y a qué hora.",
      keywords: [
        "domiciliario",
        "entrega",
        "reparto",
        "porteria",
        "qr",
        "ingreso",
        "entrar",
      ],
    },
    {
      id: "cobro",
      pregunta: "¿Cómo cobro y qué comisión me sacan?",
      respuesta:
        "Registras tu cuenta bancaria verificada y el dinero del pedido llega ahí. No trabajamos con el modelo de las apps de domicilio que se quedan con buena parte de tu margen; el detalle exacto para tu tipo de negocio te lo confirma un asesor.",
      keywords: [
        "cobro",
        "cobrar",
        "comision",
        "pago",
        "banco",
        "cuenta",
        "margen",
        "plata",
      ],
    },
    {
      id: "costo",
      pregunta: "¿Cuánto cuesta publicar mi negocio?",
      respuesta:
        "Crear la cuenta y publicar el negocio no tiene costo. Los planes pagos son para funciones adicionales de alcance y contratos, así que puedes empezar sin pagar nada.",
      keywords: ["cuesta", "precio", "gratis", "vale", "costo", "publicar", "plan"],
    },
    {
      id: "registro",
      pregunta: "¿Cómo me registro?",
      respuesta:
        "Creas la cuenta en unos minutos desde «Registrar mi negocio»: datos del negocio, cuenta bancaria y catálogo. Si prefieres que te acompañemos mientras la llenas, te paso con un asesor.",
      keywords: [
        "registro",
        "registrar",
        "cuenta",
        "crear",
        "inscribir",
        "empezar",
        "afiliar",
      ],
    },
  ],
};

/** Pistas para deducir con quién hablamos cuando escribe antes de elegir. */
const AUDIENCE_HINTS: Record<Audience, string[]> = {
  conjunto: [
    "conjunto",
    "copropiedad",
    "administrador",
    "administro",
    "edificio",
    "residencial",
    "consejo",
    "residentes",
    "asamblea",
    "porteria",
  ],
  comercio: [
    "comercio",
    "negocio",
    "tienda",
    "restaurante",
    "vender",
    "vendo",
    "producto",
    "domicilio",
    "proveedor",
    "empresa",
  ],
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/** Devuelve la audiencia que insinúa el texto libre, si es que insinúa alguna. */
export function detectAudience(text: string): Audience | null {
  const clean = normalize(text);

  const scores = (Object.keys(AUDIENCE_HINTS) as Audience[]).map((audience) => ({
    audience,
    score: AUDIENCE_HINTS[audience].filter((hint) => clean.includes(hint)).length,
  }));

  const best = scores.sort((a, b) => b.score - a.score)[0];
  return best.score > 0 ? best.audience : null;
}

/**
 * Empareja lo que escribió el visitante con una respuesta ya redactada. Gana la
 * pregunta con más palabras clave presentes; sin coincidencias devuelve null y
 * el asistente ofrece el asesor en vez de inventar.
 */
export function matchFaq(text: string, audience: Audience): Faq | null {
  const clean = normalize(text);
  if (clean.length < 3) return null;

  let best: { faq: Faq; score: number } | null = null;

  for (const faq of FAQS[audience]) {
    const score = faq.keywords.filter((keyword) =>
      clean.includes(normalize(keyword))
    ).length;

    if (score > 0 && (!best || score > best.score)) best = { faq, score };
  }

  return best?.faq ?? null;
}

/** Mensaje con el que arranca la conversación en WhatsApp, ya con contexto. */
export function buildWhatsappUrl(
  audience: Audience | null,
  topic?: string
): string {
  const advisor = ADVISORS[Math.floor(Math.random() * ADVISORS.length)];

  const quienSoy = audience ? ` Soy quien ${AUDIENCE_SELF[audience]}.` : "";
  const tema = topic ? ` Mi duda es: ${topic}` : "";
  const text = `Hola, quiero una demostración de globaliaph.${quienSoy}${tema}`;

  return `https://wa.me/${advisor}?text=${encodeURIComponent(text)}`;
}

/** Evento con el que cualquier CTA de la página abre el asistente. */
export const OPEN_EVENT = "globaliaph:open-whatsapp-assistant";
