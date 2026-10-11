/**
 * Calendario de temporadas que visten el login y la pantalla principal.
 *
 * Es TypeScript puro y sin dependencias a propósito: el mismo archivo vive en
 * la web (complexes), en la app residencial (cmplx) y en la de comercio
 * (cmplx-comercio). Si se cambia una fecha o un texto aquí, se copia igual en
 * los otros dos para que las tres caras de la plataforma celebren lo mismo el
 * mismo día.
 *
 * Las fechas son las de Colombia. Cuando la celebración cae "el segundo
 * domingo de mayo" se calcula cada año en vez de quemar el día, así no hay que
 * volver a tocar el archivo en enero.
 */

export type SeasonId =
  | "anio-nuevo"
  | "mujer"
  | "ninos-abril"
  | "madres"
  | "padres"
  | "independencia"
  | "cometas"
  | "amor-amistad"
  | "halloween"
  | "navidad";

/**
 * A quién le habla el saludo. El residente y el comercio celebran la misma
 * fecha, pero al comercio le sirve más un recordatorio de temporada de ventas
 * que un "disfruta con tus vecinos".
 */
export type SeasonAudience = "comunidad" | "comercio";

/** Si los adornos caen (nieve, pétalos) o suben (globos, cometas). */
export type SeasonMotion = "fall" | "rise";

export interface SeasonColors {
  /** Inicio y fin del degradado del banner; el texto encima va en blanco. */
  from: string;
  to: string;
  /** Color de acento para bordes y detalles. */
  accent: string;
  /** Los dos resplandores de fondo del login, con transparencia incluida. */
  glowA: string;
  glowB: string;
}

export interface SeasonalTheme {
  id: SeasonId;
  /**
   * Año al que pertenece la temporada. Junto con el id arma la clave de "ya
   * lo cerré": quien cierra el banner de Navidad 2026 lo vuelve a ver en 2027.
   */
  year: number;
  emoji: string;
  greeting: string;
  message: string;
  particles: string[];
  motion: SeasonMotion;
  colors: SeasonColors;
}

interface DateParts {
  y: number;
  /** 1 = enero. */
  m: number;
  d: number;
}

interface SeasonDef {
  id: SeasonId;
  emoji: string;
  particles: string[];
  motion: SeasonMotion;
  colors: SeasonColors;
  active: (date: DateParts) => boolean;
  copy: (
    date: DateParts,
    audience: SeasonAudience,
  ) => { greeting: string; message: string };
  /**
   * Fecha que se usa cuando la temporada se fuerza para previsualizarla: así
   * forzar "navidad" en octubre muestra el saludo del 24 y no un genérico.
   */
  preview: { m: number; d: number };
}

/** Día del mes del n-ésimo `weekday` (0 = domingo) de un mes. */
function nthWeekday(y: number, m: number, weekday: number, n: number): number {
  const first = new Date(y, m - 1, 1).getDay();
  return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
}

/** Día del mes del último `weekday` (0 = domingo) de un mes. */
function lastWeekday(y: number, m: number, weekday: number): number {
  const lastDay = new Date(y, m, 0).getDate();
  const last = new Date(y, m - 1, lastDay).getDay();
  return lastDay - ((last - weekday + 7) % 7);
}

const between = (date: DateParts, m: number, from: number, to: number) =>
  date.m === m && date.d >= from && date.d <= to;

/**
 * El orden importa: se toma la primera temporada activa. Año nuevo va antes
 * que Navidad porque el 31 de diciembre ya se saluda por el año que llega.
 */
const SEASONS: SeasonDef[] = [
  {
    id: "anio-nuevo",
    emoji: "🎆",
    particles: ["🎆", "🎇", "✨", "🥂", "🎉", "⭐"],
    motion: "rise",
    colors: {
      from: "#1e3a8a",
      to: "#a16207",
      accent: "#facc15",
      glowA: "rgba(250,204,21,0.22)",
      glowB: "rgba(59,130,246,0.25)",
    },
    active: (date) =>
      (date.m === 12 && date.d === 31) || between(date, 1, 1, 6),
    copy: (date, audience) => {
      const year = date.m === 12 ? date.y + 1 : date.y;
      return {
        greeting: `¡Feliz año ${year}!`,
        message:
          audience === "comercio"
            ? "Arranca el año con tus productos al día y tus promociones listas para los conjuntos."
            : "Que este año llegue con buenos vecinos, buenas noticias y mejores momentos en casa.",
      };
    },
    preview: { m: 1, d: 1 },
  },
  {
    id: "mujer",
    emoji: "💜",
    particles: ["💜", "🌷", "🌸", "✨", "💐"],
    motion: "rise",
    colors: {
      from: "#be185d",
      to: "#7e22ce",
      accent: "#f0abfc",
      glowA: "rgba(236,72,153,0.22)",
      glowB: "rgba(147,51,234,0.25)",
    },
    active: (date) => between(date, 3, 6, 8),
    copy: (date, audience) => ({
      greeting:
        date.d === 8 ? "¡Feliz Día de la Mujer!" : "Se acerca el Día de la Mujer",
      message:
        audience === "comercio"
          ? "Un detalle a tiempo vale doble: destaca tus regalos y descuentos para el 8 de marzo."
          : "Gracias a todas las mujeres que hacen de este conjunto un mejor lugar para vivir.",
    }),
    preview: { m: 3, d: 8 },
  },
  {
    id: "ninos-abril",
    emoji: "🎈",
    particles: ["🎈", "🪁", "🧸", "🎨", "⭐", "🍭"],
    motion: "rise",
    colors: {
      from: "#0284c7",
      to: "#f59e0b",
      accent: "#fde047",
      glowA: "rgba(56,189,248,0.25)",
      glowB: "rgba(251,191,36,0.22)",
    },
    // El Día del Niño en Colombia es el último sábado de abril.
    active: (date) =>
      date.m === 4 && date.d >= 20 && date.d <= lastWeekday(date.y, 4, 6),
    copy: (date, audience) => ({
      greeting:
        date.d === lastWeekday(date.y, 4, 6)
          ? "¡Feliz Día del Niño!"
          : "Se acerca el Día del Niño",
      message:
        audience === "comercio"
          ? "Juguetes, dulces y planes en familia: es buen momento para tus combos infantiles."
          : "Que los más pequeños del conjunto tengan un día lleno de juegos y risas.",
    }),
    preview: { m: 4, d: 25 },
  },
  {
    id: "madres",
    emoji: "💐",
    particles: ["💐", "🌹", "💖", "🌷", "🌸"],
    motion: "fall",
    colors: {
      from: "#db2777",
      to: "#e11d48",
      accent: "#fbcfe8",
      glowA: "rgba(244,114,182,0.25)",
      glowB: "rgba(225,29,72,0.22)",
    },
    // Todo mayo es "el mes de las madres"; el día es el segundo domingo.
    active: (date) => date.m === 5,
    copy: (date, audience) => {
      const day = nthWeekday(date.y, 5, 0, 2);
      return {
        greeting:
          date.d === day ? "¡Feliz Día de la Madre!" : "Mayo, mes de las madres",
        message:
          audience === "comercio"
            ? "Mayo es el mes de más regalos del primer semestre: deja listas tus promociones."
            : "Un abrazo enorme para todas las mamás de nuestra comunidad.",
      };
    },
    preview: { m: 5, d: 10 },
  },
  {
    id: "padres",
    emoji: "💙",
    particles: ["💙", "👔", "🏆", "⚽", "☕"],
    motion: "fall",
    colors: {
      from: "#1d4ed8",
      to: "#0f766e",
      accent: "#93c5fd",
      glowA: "rgba(59,130,246,0.25)",
      glowB: "rgba(20,184,166,0.22)",
    },
    // Desde el 1 de junio hasta el tercer domingo, que es el día del padre.
    active: (date) => date.m === 6 && date.d <= nthWeekday(date.y, 6, 0, 3),
    copy: (date, audience) => ({
      greeting:
        date.d === nthWeekday(date.y, 6, 0, 3)
          ? "¡Feliz Día del Padre!"
          : "Se acerca el Día del Padre",
      message:
        audience === "comercio"
          ? "Los papás también esperan su detalle: destaca tus regalos y planes especiales."
          : "Un saludo especial para todos los papás del conjunto.",
    }),
    preview: { m: 6, d: 21 },
  },
  {
    id: "independencia",
    emoji: "💛",
    particles: ["💛", "💙", "❤️", "⭐", "🎉"],
    motion: "rise",
    colors: {
      from: "#1d4ed8",
      to: "#dc2626",
      accent: "#facc15",
      glowA: "rgba(250,204,21,0.22)",
      glowB: "rgba(220,38,38,0.22)",
    },
    active: (date) => between(date, 7, 18, 20),
    copy: (date, audience) => ({
      greeting:
        date.d === 20 ? "¡Feliz 20 de julio!" : "Se acerca el 20 de julio",
      message:
        audience === "comercio"
          ? "Fin de semana festivo a la vista: prepara tu inventario para la temporada."
          : "Celebremos juntos la independencia de Colombia. ¡Que viva nuestra tierra!",
    }),
    preview: { m: 7, d: 20 },
  },
  {
    id: "cometas",
    emoji: "🪁",
    particles: ["🪁", "☁️", "🍃", "🌤️", "🪁"],
    motion: "rise",
    colors: {
      from: "#0284c7",
      to: "#16a34a",
      accent: "#bae6fd",
      glowA: "rgba(56,189,248,0.25)",
      glowB: "rgba(34,197,94,0.2)",
    },
    active: (date) => date.m === 8,
    copy: (_date, audience) => ({
      greeting: "Agosto, mes de las cometas",
      message:
        audience === "comercio"
          ? "Llegan los vientos de agosto: buen mes para planes al aire libre y promociones de temporada."
          : "Llegaron los vientos de agosto: es temporada de elevar cometas en familia.",
    }),
    preview: { m: 8, d: 15 },
  },
  {
    id: "amor-amistad",
    emoji: "💖",
    particles: ["💖", "🤝", "🎁", "💌", "🌹"],
    motion: "rise",
    colors: {
      from: "#e11d48",
      to: "#ea580c",
      accent: "#fecdd3",
      glowA: "rgba(244,63,94,0.25)",
      glowB: "rgba(249,115,22,0.2)",
    },
    // El día de Amor y Amistad es el tercer sábado de septiembre.
    active: (date) => date.m === 9,
    copy: (date, audience) => ({
      greeting:
        date.d === nthWeekday(date.y, 9, 6, 3)
          ? "¡Feliz Día del Amor y la Amistad!"
          : "Septiembre, mes del amor y la amistad",
      message:
        audience === "comercio"
          ? "Temporada de amigo secreto: destaca los detalles y regalos de tu comercio."
          : "Un buen vecino también es un amigo. ¡Feliz mes del amor y la amistad!",
    }),
    preview: { m: 9, d: 19 },
  },
  {
    id: "halloween",
    emoji: "🎃",
    particles: ["🎃", "👻", "🦇", "🍬", "🍭", "🕸️"],
    motion: "fall",
    colors: {
      from: "#ea580c",
      to: "#6d28d9",
      accent: "#fdba74",
      glowA: "rgba(249,115,22,0.25)",
      glowB: "rgba(124,58,237,0.28)",
    },
    active: (date) => date.m === 10,
    copy: (date, audience) => ({
      greeting:
        date.d === 31 ? "¡Feliz Halloween!" : "Octubre, mes de los niños",
      message:
        audience === "comercio"
          ? date.d === 31
            ? "Hoy los niños salen a pedir dulces: es el día de tus promociones de disfraces y golosinas."
            : "Se viene el 31: prepara dulces, disfraces y promociones para los niños del conjunto."
          : date.d === 31
            ? "Hoy los niños salen a pedir dulces. ¡Disfruten la noche y cuidémonos entre vecinos!"
            : "Disfraces, dulces y mucha alegría: que los niños del conjunto la pasen increíble.",
    }),
    preview: { m: 10, d: 31 },
  },
  {
    id: "navidad",
    emoji: "🎄",
    particles: ["❄️", "🎄", "🎁", "⭐", "❄️", "🔔"],
    motion: "fall",
    colors: {
      from: "#b91c1c",
      to: "#15803d",
      accent: "#fde68a",
      glowA: "rgba(239,68,68,0.22)",
      glowB: "rgba(34,197,94,0.22)",
    },
    active: (date) => between(date, 12, 1, 30),
    copy: (date, audience) => {
      if (date.d === 7 || date.d === 8) {
        return {
          greeting: "¡Feliz noche de velitas!",
          message:
            audience === "comercio"
              ? "Arranca la temporada más fuerte del año: deja tu catálogo listo para diciembre."
              : "Que la luz de cada vela ilumine a todas las familias del conjunto.",
        };
      }
      if (date.d >= 16 && date.d <= 23) {
        return {
          greeting: "¡Llegaron las novenas!",
          message:
            audience === "comercio"
              ? "Natilla, buñuelos y regalos: son los días de más pedidos en los conjuntos."
              : "Natilla, buñuelos y villancicos: es tiempo de reunirnos con los vecinos.",
        };
      }
      if (date.d === 24 || date.d === 25) {
        return {
          greeting: "¡Feliz Navidad!",
          message:
            audience === "comercio"
              ? "Gracias por acompañar a los conjuntos este año. ¡Feliz Navidad para tu equipo!"
              : "Paz, amor y mucha unión para todas las familias de nuestra comunidad.",
        };
      }
      return {
        greeting: "¡Llegó diciembre!",
        message:
          audience === "comercio"
            ? "La temporada de más ventas del año ya empezó: destaca tus productos navideños."
            : "Se siente la Navidad: luces, novenas y momentos para compartir en el conjunto.",
      };
    },
    preview: { m: 12, d: 24 },
  },
];

/** Valores de `override` que apagan la temática aunque la fecha la active. */
const OFF_VALUES = new Set(["off", "ninguno", "none", "0", "false"]);

function build(
  def: SeasonDef,
  date: DateParts,
  audience: SeasonAudience,
): SeasonalTheme {
  const { greeting, message } = def.copy(date, audience);
  return {
    id: def.id,
    // Año nuevo que empieza el 31 de diciembre pertenece al año que llega.
    year: def.id === "anio-nuevo" && date.m === 12 ? date.y + 1 : date.y,
    emoji: def.emoji,
    greeting,
    message,
    particles: def.particles,
    motion: def.motion,
    colors: def.colors,
  };
}

/**
 * Devuelve la temporada vigente, o null si la fecha no cae en ninguna.
 *
 * `override` sirve para previsualizar o apagar sin esperar a la fecha: un id
 * de temporada la fuerza ("navidad"), y "off" la apaga. Cualquier otro valor
 * se ignora y manda la fecha.
 */
export function resolveSeasonalTheme(
  now: Date,
  options: { audience?: SeasonAudience; override?: string | null } = {},
): SeasonalTheme | null {
  const audience = options.audience ?? "comunidad";
  const override = options.override?.trim().toLowerCase();
  const today: DateParts = {
    y: now.getFullYear(),
    m: now.getMonth() + 1,
    d: now.getDate(),
  };

  if (override) {
    if (OFF_VALUES.has(override)) return null;
    const forced = SEASONS.find((s) => s.id === override);
    if (forced) {
      return build(forced, { y: today.y, ...forced.preview }, audience);
    }
  }

  const def = SEASONS.find((s) => s.active(today));
  return def ? build(def, today, audience) : null;
}

/** Clave para recordar que el banner de esta temporada ya se cerró. */
export const seasonDismissKey = (theme: SeasonalTheme) =>
  `season-dismissed:${theme.id}:${theme.year}`;
