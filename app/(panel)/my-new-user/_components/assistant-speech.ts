/**
 * Voz del asistente. Vivía dentro del componente de chat, que ya pasaba de 570
 * líneas mezclando render, reconocimiento de voz, síntesis y transporte.
 */

/** Quita la sintaxis markdown que el usuario no debe ver ni oír. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*\*([^*]+)\*\*\*/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\[([^\]]+)\]\(https?:[^)]+\)/g, "$1")
    .replace(/[→⇒➜➤►▶]/g, ",")
    .replace(/->/g, ",")
    .replace(/---+/g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Además del markdown, quita lo que el sintetizador leería en voz alta mal. */
function cleanTextForSpeech(text: string): string {
  return stripMarkdown(text)
    .replace(/\$/g, " pesos")
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
    .replace(/[\u{2700}-\u{27FF}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Voces femeninas en español por plataforma. El navegador no expone el género,
 * así que hay que ir por nombre conocido. El orden aquí solo desempata entre
 * voces de la misma calidad: quién gana lo decide `voiceScore`.
 */
const FEMININE_VOICE_NAMES = [
  "Elvira",
  "Sabina",
  "Helena",
  "Paulina",
  "Laura",
  "Mónica",
  "Monica",
  "Montserrat",
  "Lucía",
  "Lucia",
  "Carmen",
  "Sofía",
  "Sofia",
  "Isabel",
  "Valentina",
  "Ximena",
  "Salomé",
  "Salome",
];

/**
 * Marcas de voz neuronal. Las voces sin estas marcas en Windows son las SAPI
 * clásicas (Elvira, Sabina, Helena a secas): suenan metálicas y son la causa
 * de que el asistente pareciera un robot.
 */
const NATURAL_HINTS = [
  "natural",
  "neural",
  "online",
  "wavenet",
  "premium",
  "enhanced",
  "siri",
];

/** Español latino antes que peninsular: el asistente habla para Colombia. */
const LANG_PREFERENCE = ["es-co", "es-us", "es-419", "es-mx", "es-ar", "es-cl"];

/**
 * Puntúa una voz por calidad percibida. Lo que más pesa es que sea neuronal o
 * remota, muy por encima de acertar el nombre o el acento: una voz neuronal
 * peninsular suena mucho mejor que una SAPI colombiana.
 */
function voiceScore(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  if (NATURAL_HINTS.some((hint) => name.includes(hint))) score += 100;
  // Una voz servida por red es sintetizada en servidor, no por el motor local.
  if (!voice.localService) score += 60;
  if (name.includes("google")) score += 30;

  const feminine = FEMININE_VOICE_NAMES.findIndex((candidate) =>
    name.includes(candidate.toLowerCase()),
  );
  if (feminine >= 0) score += 25 - feminine;
  else if (["female", "mujer", "femenin"].some((k) => name.includes(k))) {
    score += 10;
  }

  const langRank = LANG_PREFERENCE.indexOf(lang);
  if (langRank >= 0) score += 8 - langRank;

  return score;
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  const spanish = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("es"),
  );
  const pool = spanish.length > 0 ? spanish : voices;
  if (pool.length === 0) return null;

  return pool.reduce((best, voice) =>
    voiceScore(voice) > voiceScore(best) ? voice : best,
  );
}

interface SpeakCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
}

/**
 * Lee el texto en voz alta.
 *
 * `onStart`/`onEnd` existen para que el orbe entre en estado "hablando" durante
 * exactamente el tiempo que dura el audio. La API no expone la amplitud, así
 * que la animación de esa fase no puede seguir la voz; sí puede empezar y
 * terminar con ella.
 */
export function speak(text: string, callbacks: SpeakCallbacks = {}): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(text));
  utterance.lang = "es-CO";
  // Neutros a propósito: alterar el pitch en un motor local delata la síntesis.
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.onstart = () => callbacks.onStart?.();
  utterance.onend = () => callbacks.onEnd?.();
  utterance.onerror = () => callbacks.onEnd?.();

  const apply = (voices: SpeechSynthesisVoice[]) => {
    const voice = pickVoice(voices);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  const voices = window.speechSynthesis.getVoices();

  if (voices.length > 0) {
    apply(voices);
    return;
  }

  // En Chrome la lista llega de forma asíncrona la primera vez.
  window.speechSynthesis.onvoiceschanged = () => {
    apply(window.speechSynthesis.getVoices());
    window.speechSynthesis.onvoiceschanged = null;
  };
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}
