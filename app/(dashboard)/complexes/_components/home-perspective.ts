/**
 * Contenido de la portada según el actor elegido en el mapa del ecosistema.
 *
 * Sin actor elegido la portada es la de siempre: le habla al conjunto y sale
 * de las traducciones (`t`). Al elegir uno en el mapa, todas las secciones
 * —héroe, "en qué ayuda", lo que se gana, IA, módulos y cierre— se reescriben
 * desde su punto de vista, y las que no le dicen nada (inmuebles, aliados) se
 * retiran en lugar de quedarse de relleno.
 *
 * Todo sale de una misma forma (`HomeContent`) para que `hompage.tsx` pinte
 * igual sin importar de dónde vino el texto. La portada general le habla al
 * ecosistema completo; la de administración es la de "toda la administración
 * en una sola app", porque es quien contrata.
 *
 * El texto por actor está solo en español, como el resto del guión del
 * ecosistema (`ecosystem-data.ts`).
 */

import { route } from "@/app/_domain/constants/routes";
import type { ActorId } from "../../soluciones/ecosistemas/_components/ecosystem-data";

type Translate = (key: string) => string;

interface Enlace {
  texto: string;
  href: string;
}

export interface Tarjeta {
  icon: string;
  title: string;
  text: string;
}

export interface ChatDemo {
  titulo: string;
  subtitulo: string;
  icono: string;
  tono: "cyan" | "green";
  pregunta: string;
  respuesta: string;
}

export interface HomeContent {
  hero: {
    title1: string;
    title2: string;
    title3: string;
    subtitle: string;
    bullets: string[];
    cta: Enlace;
    /** Enlace secundario para comercios; se omite cuando ya es el actor. */
    mostrarEnlaceComercio: boolean;
  };
  ayuda: {
    badge: string;
    titulo: string;
    descripcion: string;
    features: string[];
    flotanteTitulo: string;
    flotanteTexto: string;
  };
  /** Inmuebles destacados: solo tiene sentido para quien arrienda o busca. */
  inmuebles: boolean;
  ingresos: {
    badge: string;
    title1: string;
    title2: string;
    subtitle: string;
    items: Tarjeta[];
  };
  /** Bloque de comercios aliados. */
  aliados: boolean;
  ia: {
    badge: string;
    titulo: string;
    subtitulo: string;
    descripcion: string;
    subtexto: string;
    features: string[];
    estadoTitulo: string;
    estadoTexto: string;
    chats: [ChatDemo, ChatDemo];
  };
  modulos: {
    badge: string;
    titulo: string;
    subtitulo: string;
    items: Tarjeta[];
  };
  cierre: {
    titulo: string;
    texto: string;
    cta: Enlace;
    /** El botón de WhatsApp solo se ofrece a quien puede contratar. */
    whatsapp: boolean;
    nota: string;
    alterno: { titulo: string; texto: string; cta: Enlace };
  };
}

type ModuloKey =
  | "cartera"
  | "asambleas"
  | "reservas"
  | "pqr"
  | "accesos"
  | "camaras"
  | "mantenimiento"
  | "emergencias"
  | "personal"
  | "documentos"
  | "parqueaderos"
  | "ia";

const ICONO_MODULO: Record<ModuloKey, string> = {
  cartera: "💳",
  asambleas: "🗳️",
  reservas: "📅",
  pqr: "🛎️",
  accesos: "🔐",
  camaras: "📹",
  mantenimiento: "🛠️",
  emergencias: "🚨",
  personal: "👷",
  documentos: "📁",
  parqueaderos: "🅿️",
  ia: "🤖",
};

const TODOS_LOS_MODULOS = Object.keys(ICONO_MODULO) as ModuloKey[];

function modulo(t: Translate, key: ModuloKey): Tarjeta {
  return {
    icon: ICONO_MODULO[key],
    title: t(`home.modules.${key}.title`),
    text: t(`home.modules.${key}.text`),
  };
}

/** Sin actor elegido: el héroe y "en qué ayuda" presentan el ecosistema entero. */
function contenidoGeneral(t: Translate): HomeContent {
  const admin = contenidoAdministracion(t);
  return {
    ...admin,
    hero: {
      ...admin.hero,
      title1: t("home.hero.ecosystem.title1"),
      title2: t("home.hero.ecosystem.title2"),
      title3: t("home.hero.ecosystem.title3"),
      subtitle: t("home.hero.ecosystem.subtitle"),
      bullets: [
        t("home.hero.ecosystem.bullet1"),
        t("home.hero.ecosystem.bullet2"),
        t("home.hero.ecosystem.bullet3"),
      ],
    },
    ayuda: {
      badge: t("home.hero.ecosystem.badge"),
      titulo: t("home.hero.ecosystem.ayudaTitle"),
      descripcion: t("home.hero.ecosystem.ayudaText"),
      features: [
        t("home.hero.ecosystem.feature1"),
        t("home.hero.ecosystem.feature2"),
        t("home.hero.ecosystem.feature3"),
      ],
      flotanteTitulo: t("home.hero.ecosystem.floatTitle"),
      flotanteTexto: t("home.hero.ecosystem.floatText"),
    },
  };
}

/** Escrita para la administración del conjunto, que es quien contrata. */
function contenidoAdministracion(t: Translate): HomeContent {
  return {
    hero: {
      title1: t("home.hero.title1"),
      title2: t("home.hero.title2"),
      title3: t("home.hero.title3"),
      subtitle: t("home.hero.subtitle"),
      bullets: [
        t("home.hero.bullet1"),
        t("home.hero.bullet2"),
        t("home.hero.bullet3"),
      ],
      cta: { texto: t("home.hero.ctaDemo"), href: route.demost },
      mostrarEnlaceComercio: true,
    },
    ayuda: {
      badge: "Plataforma inteligente",
      titulo: t("enAyuda"),
      descripcion: t("ayudaMessage"),
      features: [
        "Gestión centralizada",
        "Comunicación en tiempo real",
        "Control financiero inteligente",
      ],
      flotanteTitulo: "Gestión moderna",
      flotanteTexto: "Todo desde una sola plataforma",
    },
    inmuebles: true,
    ingresos: {
      badge: t("home.revenue.badge"),
      title1: t("home.revenue.title1"),
      title2: t("home.revenue.title2"),
      subtitle: t("home.revenue.subtitle"),
      items: (
        [
          ["parking", "🅿️"],
          ["locals", "🏬"],
          ["ads", "📢"],
          ["partners", "🤝"],
          ["stays", "🏖️"],
          ["referrals", "🎁"],
        ] as const
      ).map(([key, icon]) => ({
        icon,
        title: t(`home.revenue.${key}.title`),
        text: t(`home.revenue.${key}.text`),
      })),
    },
    aliados: true,
    ia: {
      badge: "Ecosistema IA multiagente integrado",
      titulo: "globaliaph incorpora agentes inteligentes",
      subtitulo: "para administradores, propietarios y residentes",
      descripcion:
        "globaliaph ayuda a mejorar la vida y los procesos de las unidades residenciales, ayudando a los administradores con automatización de tareas repetitivas con globaliaph Reemplaza el Excel, el grupo de WhatsApp y las cuatro plataformas sueltas por una sola.",
      subtexto:
        "Cada usuario cuenta con una experiencia IA personalizada: administradores automatizan procesos, propietarios consultan pagos y documentos, y residentes reciben soporte inmediato desde una sola plataforma inteligente.",
      features: [
        "Administradores automatizan tareas y procesos",
        "Propietarios consultan pagos y documentos al instante",
        "Residentes reciben asistencia inteligente en tiempo real",
        "Automatiza recordatorios y tareas recurrentes",
        "Gestiona mantenimientos, proveedores y reportes",
        "IA conectada directamente con el conjunto residencial",
      ],
      estadoTitulo: "Agentes IA activos",
      estadoTexto: "Automatización y asistencia en tiempo real",
      chats: [
        {
          titulo: "IA Administrativa",
          subtitulo: "Automatiza procesos y tareas operativas",
          icono: "✦",
          tono: "cyan",
          pregunta: "Recuérdame revisar la piscina todos los martes",
          respuesta:
            "✅ Recordatorio recurrente creado para todos los martes a las 5:00 PM.",
        },
        {
          titulo: "IA del Propietario",
          subtitulo: "Información y asistencia personalizada",
          icono: "⌂",
          tono: "green",
          pregunta: "¿Cuánto debo este mes y cuándo vence mi pago?",
          respuesta:
            "📄 Tu saldo pendiente es de $320.000 y vence el 28 de mayo. También puedo solicitar tu certificado de paz y salvo.",
        },
      ],
    },
    modulos: {
      badge: t("home.modules.badge"),
      titulo: t("home.modules.title"),
      subtitulo: t("home.modules.subtitle"),
      items: TODOS_LOS_MODULOS.map((key) => modulo(t, key)),
    },
    cierre: {
      titulo: t("home.closing.title"),
      texto: t("home.closing.text"),
      cta: { texto: t("home.closing.ctaDemo"), href: route.demost },
      whatsapp: true,
      nota: t("home.closing.note"),
      alterno: {
        titulo: t("home.closing.comercioTitle"),
        texto: t("home.closing.comercioText"),
        cta: { texto: t("home.closing.comercioCta"), href: route.comercios },
      },
    },
  };
}

function contenidoResidentes(t: Translate): HomeContent {
  const general = contenidoGeneral(t);
  return {
    hero: {
      title1: "Tu conjunto",
      title2: "entero en",
      title3: "el celular",
      subtitle:
        "Paga, reserva, abre la puerta y pide a domicilio sin bajar a portería ni perseguir el grupo de WhatsApp.",
      bullets: [
        "Pagas la cuota en línea y tu saldo se actualiza solo.",
        "Autorizas visitas y domicilios con un QR, sin llamadas al apartamento.",
        "Reservas el salón, el BBQ o la cancha y votas en la asamblea desde donde estés.",
      ],
      cta: { texto: "Recomiéndalo a tu administración", href: route.demost },
      mostrarEnlaceComercio: true,
    },
    ayuda: {
      badge: "Para residentes",
      titulo: "¿Qué cambia en tu día a día?",
      descripcion:
        "Lo que antes era una fila en portería, un recibo en papel o una pregunta perdida en el chat del conjunto pasa a ser un botón en la app.",
      features: [
        "Citofonía virtual al celular",
        "Reservas sin planillas",
        "Comunicados que sí llegan",
      ],
      flotanteTitulo: "Todo desde el celular",
      flotanteTexto: "Sin bajar a portería",
    },
    inmuebles: true,
    ingresos: {
      badge: "Lo que te ahorras",
      title1: "Vivir en el conjunto también se vuelve más",
      title2: "fácil",
      subtitle:
        "No es una app más para descargar: reemplaza trámites que hoy te cuestan tiempo, llamadas y filas.",
      items: [
        {
          icon: "💳",
          title: "Pagos sin fila",
          text: "Pagas la cuota desde el celular y ves tu saldo actualizado al instante, sin enviar comprobantes por WhatsApp.",
        },
        {
          icon: "📅",
          title: "Reservas claras",
          text: "Ves qué zonas están libres, reservas con las reglas del conjunto y recibes la confirmación al momento.",
        },
        {
          icon: "🔐",
          title: "Visitas sin llamadas",
          text: "Generas un QR para tu visita o tu domicilio; portería lo escanea y queda registrado.",
        },
        {
          icon: "🛍️",
          title: "Comercios del barrio",
          text: "Pides a negocios aliados cerca del conjunto, con entrega a la puerta y acceso por QR.",
        },
        {
          icon: "🗳️",
          title: "Tu voto cuenta",
          text: "Participas en asambleas y votaciones sin tener que estar en el salón comunal.",
        },
        {
          icon: "🛎️",
          title: "PQR con seguimiento",
          text: "Radicas una solicitud y ves en qué va, en lugar de repetirla en el grupo del conjunto.",
        },
      ],
    },
    aliados: true,
    ia: {
      badge: "Asistente IA para residentes",
      titulo: "globaliaph responde",
      subtitulo: "las preguntas de tu día a día",
      descripcion:
        "Un asistente que conoce las reglas, los horarios y tu estado de cuenta, y responde a cualquier hora sin que tengas que esperar a la administración.",
      subtexto:
        "Pregunta por tu saldo, reserva una zona o consulta el reglamento: la respuesta llega al instante y con los datos reales de tu conjunto.",
      features: [
        "Consulta tu saldo y tus fechas de pago",
        "Reserva zonas comunes conversando",
        "Resuelve dudas del reglamento al instante",
        "Autoriza visitas y domicilios con QR",
      ],
      estadoTitulo: "Asistente disponible",
      estadoTexto: "Respuestas a cualquier hora",
      chats: [
        {
          titulo: "IA del residente",
          subtitulo: "Respuestas con los datos de tu conjunto",
          icono: "⌂",
          tono: "green",
          pregunta: "¿Está libre el BBQ este sábado en la tarde?",
          respuesta:
            "✅ Sí, de 2:00 a 6:00 PM. ¿Te lo reservo? El depósito es de $50.000.",
        },
        {
          titulo: "Visitas y domicilios",
          subtitulo: "Portería sabe quién llega",
          icono: "✦",
          tono: "cyan",
          pregunta: "Espero un domicilio en media hora",
          respuesta:
            "🔐 Listo, generé un QR para el domiciliario. Portería lo deja subir al escanearlo.",
        },
      ],
    },
    modulos: {
      badge: "Lo que usas tú",
      titulo: "Los módulos que vas a abrir cada semana",
      subtitulo:
        "Todo esto ya funciona dentro de globaliaph y viene incluido para los residentes del conjunto.",
      items: (
        [
          "cartera",
          "reservas",
          "accesos",
          "camaras",
          "pqr",
          "asambleas",
          "parqueaderos",
          "ia",
        ] as const
      ).map((key) => modulo(t, key)),
    },
    cierre: {
      titulo: "¿Quieres esto en tu conjunto?",
      texto:
        "globaliaph lo contrata la administración. Si quieres que tu conjunto lo tenga, cuéntanos y le mostramos una demo al administrador o al consejo.",
      cta: { texto: "Recomiéndalo a tu administración", href: route.demost },
      whatsapp: true,
      nota: "La demostración es gratis y dura unos 30 minutos.",
      alterno: general.cierre.alterno,
    },
  };
}

function contenidoComercios(t: Translate): HomeContent {
  return {
    hero: {
      title1: "Véndele",
      title2: "a cientos de hogares a pocas cuadras de",
      title3: "tu negocio",
      subtitle:
        "Entra al ecosistema de los conjuntos: contratos con la administración y pedidos directos de las familias, sin pagarle comisión a una app de domicilios.",
      bullets: [
        "B2B: ofrece aseo, jardinería, mantenimiento o seguridad a los conjuntos.",
        "B2C: publica tu catálogo y recibe pedidos de los residentes.",
        "Tu reputación por estrellas viaja contigo de un conjunto al siguiente.",
      ],
      cta: { texto: "Registrar mi comercio", href: route.comercios },
      mostrarEnlaceComercio: false,
    },
    ayuda: {
      badge: "Para comercios aliados",
      titulo: "¿Qué gana tu negocio?",
      descripcion:
        "Los conjuntos ya compran servicios y los residentes ya piden a domicilio. globaliaph pone tu negocio justo donde se toman esas decisiones.",
      features: [
        "Clientes a pocas cuadras",
        "Contratos recurrentes",
        "Reputación verificable",
      ],
      flotanteTitulo: "Tu vitrina en el conjunto",
      flotanteTexto: "Pedidos y contratos en un solo lugar",
    },
    inmuebles: false,
    ingresos: {
      badge: "Cómo entra la plata a tu negocio",
      title1: "Un canal de ventas que además",
      title2: "se recomienda solo",
      subtitle:
        "Dos vías de ingreso dentro de la misma plataforma, y una reputación que te abre la puerta del siguiente conjunto.",
      items: [
        {
          icon: "🤝",
          title: "Contratos B2B",
          text: "Aseo, jardinería, mantenimiento o seguridad contratados por la administración, con vigencia y responsable.",
        },
        {
          icon: "🛍️",
          title: "Catálogo B2C",
          text: "Publicas tus productos y los residentes te piden desde la app de su conjunto.",
        },
        {
          icon: "🔐",
          title: "Entrega con QR",
          text: "Tu domiciliario entra con un QR que portería escanea: sin llamadas ni esperas en la puerta.",
        },
        {
          icon: "⭐",
          title: "Calificación por estrellas",
          text: "Cada trabajo bien hecho suma a una reputación que los demás conjuntos ven antes de contratarte.",
        },
        {
          icon: "💰",
          title: "Pago a cuenta verificada",
          text: "Los pagos llegan a una cuenta verificada, con registro de cada pedido y cada contrato.",
        },
        {
          icon: "📢",
          title: "Cartelera del conjunto",
          text: "Aparece en la cartelera digital que los residentes revisan todos los días.",
        },
      ],
    },
    aliados: true,
    ia: {
      badge: "Panel del comercio aliado",
      titulo: "Todo tu negocio con los conjuntos",
      subtitulo: "en un mismo panel",
      descripcion:
        "Pedidos de los residentes, solicitudes de servicio de la administración y tu reputación, en un solo lugar y no en veinte chats de WhatsApp.",
      subtexto:
        "Cada pedido llega con apartamento y QR de entrega; cada alianza, con vigencia y calificación. Sabes qué te toca hoy y cómo te ven los conjuntos.",
      features: [
        "Recibe los pedidos de los residentes en un solo lugar",
        "Responde las solicitudes de servicio de los conjuntos",
        "Sigue tus contratos vigentes y tus calificaciones",
        "Coordina las entregas con portería por QR",
      ],
      estadoTitulo: "Comercio conectado",
      estadoTexto: "Pedidos y alianzas en tiempo real",
      chats: [
        {
          titulo: "Pedidos B2C",
          subtitulo: "Lo que te piden los residentes",
          icono: "🛍️",
          tono: "cyan",
          pregunta: "Pedido nuevo · Torre 3, apto 502: 2 almuerzos ejecutivos",
          respuesta:
            "✅ Pedido confirmado. El QR de entrega ya está en portería.",
        },
        {
          titulo: "Alianzas B2B",
          subtitulo: "Contratos con la administración",
          icono: "🤝",
          tono: "green",
          pregunta:
            "Buscamos servicio de jardinería mensual para las zonas comunes",
          respuesta:
            "🌿 Propuesta enviada: visita técnica el jueves y contrato a 12 meses.",
        },
      ],
    },
    modulos: {
      badge: "Lo que usas tú",
      titulo: "Las herramientas del comercio aliado",
      subtitulo:
        "Todo incluido al registrar tu negocio dentro de globaliaph.",
      items: [
        {
          icon: "🤝",
          title: "Alianzas B2B",
          text: "Ofreces tus servicios a la administración de cada conjunto y cierras contratos con vigencia y responsable.",
        },
        {
          icon: "🛍️",
          title: "Catálogo B2C",
          text: "Publicas tus productos con precio y fotos para que los residentes pidan desde la app.",
        },
        {
          icon: "🏪",
          title: "Marketplace",
          text: "Tu negocio aparece junto a los demás aliados que atienden a los conjuntos de tu zona.",
        },
        {
          icon: "⭐",
          title: "Calificación por estrellas",
          text: "Las calificaciones de cada alianza real construyen tu reputación frente a otros conjuntos.",
        },
        {
          icon: "🔐",
          title: "QR de entrega",
          text: "Cada pedido lleva su QR para que portería deje pasar a tu domiciliario sin llamadas.",
        },
        {
          icon: "💰",
          title: "Pago a cuenta verificada",
          text: "Cobras a una cuenta verificada y cada pago queda asociado a su pedido o contrato.",
        },
      ],
    },
    cierre: {
      titulo: "Registra tu comercio y empieza a venderle a los conjuntos",
      texto:
        "El registro es gratis. Publicas tu catálogo o tus servicios y los conjuntos de tu zona empiezan a verte.",
      cta: { texto: "Registrar mi comercio", href: route.comercios },
      whatsapp: false,
      nota: "¿Ya eres aliado? Entra a tu panel para ver tus pedidos y alianzas.",
      alterno: {
        titulo: "¿Administras un conjunto y no un comercio?",
        texto:
          "Te mostramos la plataforma completa con los datos de tu copropiedad.",
        cta: { texto: t("home.closing.ctaDemo"), href: route.demost },
      },
    },
  };
}

function contenidoPorteria(t: Translate): HomeContent {
  const general = contenidoGeneral(t);
  return {
    hero: {
      title1: "Portería",
      title2: "sin minuta a mano ni",
      title3: "llamadas al apartamento",
      subtitle:
        "El visitante, el domiciliario y el residente llegan ya identificados: portería escanea, abre y todo queda registrado.",
      bullets: [
        "Visitas y domicilios autorizados con QR desde el celular del residente.",
        "Registro automático de entradas, salidas y parqueaderos.",
        "Turnos, rondas, cámaras y protocolos de emergencia en el mismo lugar.",
      ],
      cta: { texto: "Agendar la demostración", href: route.demost },
      mostrarEnlaceComercio: true,
    },
    ayuda: {
      badge: "Para portería y personal",
      titulo: "¿Qué cambia en la portería?",
      descripcion:
        "Menos tiempo al citófono y más control real de quién entra y quién sale. La información llega antes que la persona.",
      features: [
        "Accesos con QR",
        "Minuta digital automática",
        "Turnos y rondas organizados",
      ],
      flotanteTitulo: "Portería conectada",
      flotanteTexto: "Cada ingreso queda registrado",
    },
    inmuebles: false,
    ingresos: {
      badge: "Lo que se gana en la operación",
      title1: "Una portería que controla más",
      title2: "con menos esfuerzo",
      subtitle:
        "El trabajo de portería no desaparece: deja de depender del citófono, del libro de minuta y de la memoria de cada turno.",
      items: [
        {
          icon: "🔐",
          title: "QR en la puerta",
          text: "Escaneas el código y sabes quién es, a qué apartamento va y quién lo autorizó.",
        },
        {
          icon: "📝",
          title: "Minuta automática",
          text: "Cada ingreso queda registrado con hora y persona, sin libro ni letra ilegible.",
        },
        {
          icon: "🅿️",
          title: "Parqueaderos controlados",
          text: "Ves qué celdas están ocupadas y a quién pertenecen los vehículos visitantes.",
        },
        {
          icon: "📹",
          title: "Cámaras integradas",
          text: "Las cámaras del conjunto se consultan desde la misma plataforma.",
        },
        {
          icon: "👷",
          title: "Turnos claros",
          text: "Turnos, rondas y actividades del personal asignados y visibles para todos.",
        },
        {
          icon: "🚨",
          title: "Emergencias a la mano",
          text: "Protocolos, brigadas y reportes de emergencia disponibles en tiempo real.",
        },
      ],
    },
    aliados: false,
    ia: {
      badge: "Portería conectada",
      titulo: "La portería trabaja",
      subtitulo: "con la información antes que la persona",
      descripcion:
        "Las autorizaciones de los residentes y los domicilios de los comercios aliados llegan a portería antes de que alguien toque la puerta.",
      subtexto:
        "Portería escanea, confirma y registra. El residente recibe el aviso y la administración conserva el historial sin que nadie transcriba nada.",
      features: [
        "Escanea el QR de visitantes y domiciliarios",
        "Consulta las autorizaciones del residente al instante",
        "Registra novedades en la minuta digital",
        "Activa los protocolos de emergencia",
      ],
      estadoTitulo: "Portería en línea",
      estadoTexto: "Ingresos registrados en tiempo real",
      chats: [
        {
          titulo: "Visitas autorizadas",
          subtitulo: "Lo que llega antes que la persona",
          icono: "🔐",
          tono: "cyan",
          pregunta: "Apto 1204 autorizó a Carlos Ruiz · hoy 7:00 PM",
          respuesta:
            "✅ QR escaneado a las 7:04 PM. Ingreso registrado en la minuta.",
        },
        {
          titulo: "Domicilios",
          subtitulo: "Entregas de comercios aliados",
          icono: "🛵",
          tono: "green",
          pregunta: "Domicilio para Torre 2, apto 301",
          respuesta:
            "✅ QR validado. El residente recibió el aviso de que su pedido va subiendo.",
        },
      ],
    },
    modulos: {
      badge: "Lo que usa portería",
      titulo: "Los módulos de la operación diaria",
      subtitulo:
        "Todo esto ya funciona dentro de globaliaph y lo usan portería y el personal del conjunto.",
      items: (
        [
          "accesos",
          "parqueaderos",
          "camaras",
          "personal",
          "emergencias",
          "mantenimiento",
        ] as const
      ).map((key) => modulo(t, key)),
    },
    cierre: {
      titulo: "Una portería conectada empieza con una demostración",
      texto:
        "La plataforma la contrata la administración. Te mostramos la portería con QR, minuta digital y turnos en unos 30 minutos.",
      cta: { texto: "Agendar la demostración", href: route.demost },
      whatsapp: true,
      nota: "¿Eres parte del personal? Comparte esta página con tu administrador.",
      alterno: general.cierre.alterno,
    },
  };
}

function contenidoPropietarios(t: Translate): HomeContent {
  return {
    hero: {
      title1: "Arrienda o vende",
      title2: "dentro de una comunidad",
      title3: "ya verificada",
      subtitle:
        "Publica tu inmueble donde los interesados ya viven cerca, y lleva pagos, documentos y paz y salvo desde el mismo lugar.",
      bullets: [
        "Publica en arriendo, venta o alquiler vacacional sin comisión de portal.",
        "Consulta el saldo, los pagos y los certificados de tu inmueble al instante.",
        "Controla el acceso de huéspedes e inquilinos con QR.",
      ],
      cta: { texto: "Ver inmuebles publicados", href: route.immovables },
      mostrarEnlaceComercio: true,
    },
    ayuda: {
      badge: "Para propietarios",
      titulo: "¿Qué gana tu inmueble?",
      descripcion:
        "Tu propiedad deja de depender de portales abiertos y de intermediarios: se mueve dentro de la comunidad del conjunto, con la información en regla.",
      features: [
        "Publicación sin comisión",
        "Estado de cuenta al día",
        "Paz y salvo sin trámites",
      ],
      flotanteTitulo: "Tu inmueble en orden",
      flotanteTexto: "Pagos, documentos y publicación",
    },
    inmuebles: true,
    ingresos: {
      badge: "Cómo rinde tu inmueble",
      title1: "Tu propiedad no solo se administra, también",
      title2: "produce",
      subtitle:
        "Arriendo, venta, rentas por días y hasta la celda de parqueadero: cada forma de sacarle provecho, con el respaldo del conjunto.",
      items: [
        {
          icon: "🏠",
          title: "Arriendo o venta",
          text: "Publicas tu inmueble en el marketplace de los conjuntos, sin comisión de portal.",
        },
        {
          icon: "🏖️",
          title: "Alquiler vacacional",
          text: "Rentas por días con control de acceso para los huéspedes.",
        },
        {
          icon: "🅿️",
          title: "Parqueadero en alquiler",
          text: "Si no usas tu celda, la arriendas a otros residentes con cobro desde la plataforma.",
        },
        {
          icon: "📄",
          title: "Paz y salvo del inmueble",
          text: "Certificados al día para arrendar o vender sin trámites de última hora.",
        },
        {
          icon: "📊",
          title: "Resumen de inmuebles",
          text: "Ves en un solo lugar el estado de todos tus inmuebles dentro del ecosistema.",
        },
        {
          icon: "🔐",
          title: "Inquilinos y huéspedes con QR",
          text: "Autorizas el ingreso de quien se queda en tu inmueble sin llamar a portería.",
        },
      ],
    },
    aliados: false,
    ia: {
      badge: "Asistente IA del propietario",
      titulo: "globaliaph responde",
      subtitulo: "por tu inmueble",
      descripcion:
        "Saldos, fechas de pago, certificados y publicaciones: el asistente responde con los datos reales de tu inmueble, sin esperar a la administración.",
      subtexto:
        "Pides el paz y salvo, revisas cómo va tu publicación o autorizas a un huésped en la misma conversación.",
      features: [
        "Consulta saldos y fechas de pago",
        "Solicita tu paz y salvo",
        "Revisa tus publicaciones de arriendo o venta",
        "Autoriza huéspedes e inquilinos",
      ],
      estadoTitulo: "Asistente disponible",
      estadoTexto: "Tu inmueble al día",
      chats: [
        {
          titulo: "IA del Propietario",
          subtitulo: "Información y asistencia personalizada",
          icono: "⌂",
          tono: "green",
          pregunta: "¿Cuánto debo este mes y cuándo vence mi pago?",
          respuesta:
            "📄 Tu saldo pendiente es de $320.000 y vence el 28 de mayo. También puedo solicitar tu certificado de paz y salvo.",
        },
        {
          titulo: "Tus publicaciones",
          subtitulo: "Arriendo, venta y vacacional",
          icono: "🏠",
          tono: "cyan",
          pregunta: "¿Mi apartamento de la Torre 4 sigue publicado?",
          respuesta:
            "🏠 Sí, está publicado en arriendo. ¿Quieres actualizar el precio o las fotos?",
        },
      ],
    },
    modulos: {
      badge: "Lo que usas tú",
      titulo: "Los módulos del propietario",
      subtitulo:
        "Todo esto ya funciona dentro de globaliaph para los dueños de inmuebles del conjunto.",
      items: [
        {
          icon: "🏠",
          title: "Arrienda o vende",
          text: "Publica tu inmueble con fotos, precio y condiciones dentro del marketplace de los conjuntos.",
        },
        {
          icon: "🏖️",
          title: "Alquiler vacacional",
          text: "Renta por días con fechas, reglas y control de acceso para cada huésped.",
        },
        {
          icon: "📊",
          title: "Resumen de inmuebles",
          text: "El estado de todos tus inmuebles, sus pagos y sus publicaciones en una sola vista.",
        },
        {
          icon: "📄",
          title: "Paz y salvo del inmueble",
          text: "Solicitas el certificado y lo recibes sin ir a la oficina de administración.",
        },
        modulo(t, "cartera"),
        modulo(t, "documentos"),
      ],
    },
    cierre: {
      titulo: "Publica tu inmueble donde ya lo están buscando",
      texto:
        "Si tu conjunto usa globaliaph, puedes publicar hoy. Si todavía no, recomiéndalo a tu administración.",
      cta: { texto: "Ver inmuebles publicados", href: route.immovables },
      whatsapp: false,
      nota: "Publicar en el marketplace de los conjuntos no tiene comisión de portal.",
      alterno: {
        titulo: "¿Tu conjunto todavía no está en globaliaph?",
        texto:
          "Le mostramos la plataforma a tu administración en una demostración de 30 minutos.",
        cta: { texto: t("home.closing.ctaDemo"), href: route.demost },
      },
    },
  };
}

export function contenidoHome(
  actor: ActorId | null,
  t: Translate,
): HomeContent {
  switch (actor) {
    case "residentes":
      return contenidoResidentes(t);
    case "comercios":
      return contenidoComercios(t);
    case "porteria":
      return contenidoPorteria(t);
    case "propietarios":
      return contenidoPropietarios(t);
    case "administracion":
      // Los inmuebles destacados son del propietario, no de la administración.
      return { ...contenidoAdministracion(t), inmuebles: false };
    default:
      return contenidoGeneral(t);
  }
}
