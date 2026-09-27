/**
 * Formas de boca de Lary a partir del texto que dice.
 *
 * En español cada sílaba gira alrededor de una vocal y es la vocal la que da
 * la forma de la boca: la "a" abre, la "o" y la "u" redondean, la "e" y la "i"
 * estiran. Con eso basta para que la boca acompañe a la voz sin un modelo de
 * fonemas completo.
 */

export interface MouthShape {
  /** Apertura 0-1. */
  open: number;
  /** Ancho relativo: menos de 1 redondea ("o"), más de 1 estira ("i"). */
  wide: number;
}

const VOWELS: Record<string, MouthShape> = {
  a: { open: 0.9, wide: 1 },
  e: { open: 0.55, wide: 1.06 },
  i: { open: 0.32, wide: 1.1 },
  o: { open: 0.7, wide: 0.8 },
  u: { open: 0.4, wide: 0.74 },
};

/** Cuando un grupo tiene varias vocales ("ue", "ia"), manda la más abierta. */
const STRENGTH = "aoeui";

const ACCENTS: Record<string, string> = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ú: "u",
  ü: "u",
};

/** Una forma por sílaba de la palabra, en orden. */
export function wordShapes(word: string): MouthShape[] {
  const lower = word.toLowerCase();
  const nuclei = lower.match(/[aeiouáéíóúü]+/g);

  // Números y siglas se dicen, pero no traen vocales escritas: se aproxima
  // una sílaba por cada dos caracteres.
  if (!nuclei) {
    const count = Math.max(1, Math.round(lower.replace(/\W/g, "").length / 2));
    return Array.from({ length: count }, (_, i) =>
      jitter(i % 2 === 0 ? VOWELS.a : VOWELS.e),
    );
  }

  return nuclei.map((nucleus) => {
    const stressed = /[áéíóú]/.test(nucleus);
    const plain = nucleus.replace(/[áéíóúü]/g, (c) => ACCENTS[c] ?? c);
    const vowel =
      STRENGTH.split("").find((candidate) => plain.includes(candidate)) ?? "a";
    const shape = jitter(VOWELS[vowel]);
    // La sílaba con tilde se dice con más fuerza.
    return stressed ? { ...shape, open: Math.min(1, shape.open + 0.1) } : shape;
  });
}

/** Una misma vocal nunca sale igual dos veces seguidas. */
function jitter(shape: MouthShape): MouthShape {
  return {
    open: Math.max(0.2, Math.min(1, shape.open + (Math.random() - 0.5) * 0.16)),
    wide: shape.wide + (Math.random() - 0.5) * 0.06,
  };
}

/** Milisegundos por sílaba a velocidad normal de la voz. */
export const SYLLABLE_MS = 165;
