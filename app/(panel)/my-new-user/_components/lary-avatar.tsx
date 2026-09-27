"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { OrbState } from "./assistant-orb";
import { onSpokenWord } from "./assistant-speech";
import { MouthShape, SYLLABLE_MS, wordShapes } from "./lary-visemes";

interface Props {
  state: OrbState;
  /** Volumen del micrófono (0-1). Solo se usa en estado `listening`. */
  level?: number;
  size?: number;
}

/**
 * Lary en persona: la ilustración de `/gcmplx.png` con gestos por estado.
 *
 * El orbe decía lo mismo con colores, pero a una cara se le lee el estado sin
 * pensarlo: mueve la cabeza y la boca mientras habla, se inclina hacia ti
 * mientras escucha y ladea la cabeza mientras piensa.
 *
 * La ilustración es una sola imagen fija, así que la boca es una capa encima
 * que se abre entre los labios. Cuando la voz avisa cada palabra, la boca dice
 * sus vocales (la "a" abre, la "o" redondea, la "i" estira). Hay voces que no
 * avisan; con ellas el ritmo imita el habla: sílabas agrupadas en palabras,
 * con pausas entre palabras y frases.
 *
 * Parpadea cada pocos segundos con tres cuadros pre-renderizados de los
 * párpados (`/lary/lary-blink-*.png`), recortados a la zona de los ojos.
 *
 * Con `prefers-reduced-motion` queda quieta; el color del halo sigue diciendo
 * en qué estado está.
 */

/**
 * Hueco de la boca, en fracción del lado de la imagen: centrado en la línea
 * entre los labios y del tamaño que admite el estilo de la ilustración. Antes
 * era una elipse que tapaba casi toda la boca y se leía como una mancha.
 */
const MOUTH = { x: 0.55, y: 0.525, width: 0.05, height: 0.016 };

const GLOW: Record<OrbState, string> = {
  idle: "rgba(79,70,229,0.45)",
  listening: "rgba(34,211,238,0.6)",
  thinking: "rgba(168,85,247,0.55)",
  speaking: "rgba(56,189,248,0.6)",
};

/**
 * Zona de los ojos que cubren los cuadros de parpadeo, en píxeles de la
 * ilustración original (1254 × 1254).
 */
const EYES_BOX = { x: 536, y: 462, width: 300, height: 120 };
const SOURCE_SIZE = 1254;
const BLINK_FRAMES = [
  "/lary/lary-blink-1.png",
  "/lary/lary-blink-2.png",
  "/lary/lary-blink-3.png",
];
/** Cuadro y milisegundos: cierra rápido, se sostiene y abre algo más lento. */
const BLINK_SEQUENCE: [number, number][] = [
  [1, 25],
  [2, 25],
  [3, 60],
  [2, 35],
  [1, 35],
];

interface MouthPose extends MouthShape {
  /** Segundos que tarda en llegar a esta pose. */
  duration: number;
}

const CLOSED: MouthPose = { open: 0, wide: 1, duration: 0.12 };

const between = (min: number, max: number) => min + Math.random() * (max - min);

export default function LaryAvatar({ state, level = 0, size = 240 }: Props) {
  const reduceMotion = useReducedMotion();
  const [mouth, setMouth] = useState<MouthPose>(CLOSED);
  /** 0 con los ojos abiertos; 1-3, cuadro del parpadeo. */
  const [blinkFrame, setBlinkFrame] = useState(0);

  // Parpadeo cada pocos segundos, a veces doble, en cualquier estado.
  useEffect(() => {
    if (reduceMotion) {
      setBlinkFrame(0);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    const blink = (then: () => void) => {
      let index = 0;
      const next = () => {
        if (index >= BLINK_SEQUENCE.length) {
          setBlinkFrame(0);
          then();
          return;
        }
        const [frame, ms] = BLINK_SEQUENCE[index++];
        setBlinkFrame(frame);
        timer = setTimeout(next, ms);
      };
      next();
    };

    const schedule = () => {
      timer = setTimeout(
        () =>
          blink(() => {
            if (Math.random() < 0.15) {
              timer = setTimeout(() => blink(schedule), 180);
            } else {
              schedule();
            }
          }),
        between(2800, 6000),
      );
    };

    schedule();
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  // Boca: dice las vocales de cada palabra si la voz las avisa; si no, imita
  // el ritmo del habla. Solo mientras suena la voz.
  useEffect(() => {
    if (state !== "speaking" || reduceMotion) {
      setMouth(CLOSED);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    let syllablesLeft = 0;
    let wordsInSentence = 0;
    /** Pasa a true con la primera palabra avisada: el ritmo imitado se retira. */
    let synced = false;

    const articulate = (shapes: MouthShape[], index = 0) => {
      if (index >= shapes.length) return;

      const openFor = SYLLABLE_MS * 0.55;
      setMouth({ ...shapes[index], duration: openFor / 1000 });

      timer = setTimeout(() => {
        const closeFor = SYLLABLE_MS * 0.45;
        const last = index === shapes.length - 1;
        // Al final de la palabra cierra del todo hasta que llegue la siguiente.
        setMouth((prev) => ({
          open: last ? 0 : between(0.08, 0.2),
          wide: last ? 1 : prev.wide,
          duration: closeFor / 1000,
        }));
        timer = setTimeout(() => articulate(shapes, index + 1), closeFor);
      }, openFor);
    };

    const unsubscribe = onSpokenWord((word) => {
      synced = true;
      clearTimeout(timer);
      articulate(wordShapes(word));
    });

    const step = () => {
      if (synced) return;

      if (syllablesLeft === 0) {
        // Entre palabras cierra del todo; cada tantas palabras, pausa de frase.
        const sentenceEnd = wordsInSentence > 5 && Math.random() < 0.25;
        wordsInSentence = sentenceEnd ? 0 : wordsInSentence + 1;
        syllablesLeft = 1 + Math.floor(Math.random() * 3.4);

        setMouth({ open: 0, wide: 1, duration: 0.09 });
        timer = setTimeout(
          step,
          sentenceEnd ? between(380, 560) : between(70, 190),
        );
        return;
      }

      syllablesLeft -= 1;
      // Alguna sílaba sale acentuada; el resto abre a medias.
      const stressed = Math.random() < 0.2;
      const openFor = between(95, 135);

      setMouth({
        open: stressed ? between(0.8, 1) : between(0.35, 0.7),
        wide: between(0.82, 1.06),
        duration: openFor / 1000,
      });

      // Entre sílabas de una misma palabra la boca no llega a cerrarse.
      timer = setTimeout(() => {
        if (synced) return;
        const closeFor = between(80, 115);
        setMouth((prev) => ({
          open: between(0.08, 0.22),
          wide: prev.wide,
          duration: closeFor / 1000,
        }));
        timer = setTimeout(step, closeFor);
      }, openFor);
    };

    step();
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [state, reduceMotion]);

  const head = reduceMotion
    ? { animate: { rotate: 0, y: 0, scale: 1 }, transition: { duration: 0 } }
    : {
        idle: {
          animate: { rotate: [0, 0.8, 0], y: [0, -3, 0], scale: 1 },
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
        },
        // Hablando, la cabeza acompaña con un vaivén lento y pequeño. Un
        // balanceo rápido la hacía ver como un muñeco de resorte.
        speaking: {
          animate: {
            rotate: [-1, 0.7, -0.3, 1.1, -1],
            y: [0, -1.5, -0.4, -1.2, 0],
            scale: 1.01,
          },
          transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut" as const },
        },
        // Escuchando se inclina hacia el usuario y se acerca con su voz.
        listening: {
          animate: { rotate: -3, y: -2, scale: 1.03 + level * 0.04 },
          transition: { duration: 0.15, ease: "easeOut" as const },
        },
        thinking: {
          animate: { rotate: [4, 6, 4], y: [-2, -4, -2], scale: 1 },
          transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" as const },
        },
      }[state];

  const mouthWidth = size * MOUTH.width;
  const mouthHeight = size * MOUTH.height;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label="Lary, la asistente"
    >
      {/* Halo por estado */}
      <motion.div
        className="absolute inset-[4%] rounded-full blur-xl"
        style={{ background: GLOW[state] }}
        animate={
          reduceMotion
            ? { opacity: 0.6 }
            : { opacity: state === "idle" ? [0.35, 0.6, 0.35] : [0.55, 1, 0.55] }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: state === "idle" ? 4 : 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />

      {/* Anillo giratorio mientras piensa */}
      {state === "thinking" && !reduceMotion ? (
        <motion.div
          className="absolute inset-[2%] rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, #a855f7 90deg, transparent 200deg)",
            maskImage: "radial-gradient(circle, transparent 66%, black 68%)",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 66%, black 68%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />
      ) : null}

      {/* Onda de escucha */}
      {state === "listening" && !reduceMotion ? (
        <motion.div
          className="absolute inset-[6%] rounded-full border-2 border-cyan-300"
          animate={{ scale: [1, 1.25], opacity: [0.7, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />
      ) : null}

      {/* Lary. El giro se ancla abajo, en los hombros, para que se lea como un
          movimiento de cabeza y no como una foto rotando. */}
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{ transformOrigin: "50% 85%" }}
        animate={head.animate}
        transition={head.transition}
      >
        <Image
          src="/gcmplx.png"
          alt=""
          fill
          sizes={`${size}px`}
          className="select-none object-cover"
          draggable={false}
          priority
        />

        {/* Párpados. Los tres cuadros quedan montados y se alterna la
            opacidad: cargarlos al parpadear dejaría el primero en blanco. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: `${(EYES_BOX.x / SOURCE_SIZE) * 100}%`,
            top: `${(EYES_BOX.y / SOURCE_SIZE) * 100}%`,
            width: `${(EYES_BOX.width / SOURCE_SIZE) * 100}%`,
            height: `${(EYES_BOX.height / SOURCE_SIZE) * 100}%`,
          }}
        >
          {BLINK_FRAMES.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              sizes={`${Math.ceil((size * EYES_BOX.width) / SOURCE_SIZE)}px`}
              className="select-none"
              style={{ opacity: blinkFrame === index + 1 ? 1 : 0 }}
              draggable={false}
            />
          ))}
        </div>

        {/* Hueco de la boca: del color del labio en el borde al fondo oscuro,
            con los dientes de arriba insinuados. Se abre hacia abajo desde la
            línea de los labios, como cuando baja la mandíbula. */}
        <motion.span
          aria-hidden="true"
          className="absolute overflow-hidden rounded-[50%]"
          style={{
            left: `${MOUTH.x * 100}%`,
            top: `${MOUTH.y * 100}%`,
            width: mouthWidth,
            height: mouthHeight,
            marginLeft: -mouthWidth / 2,
            marginTop: -mouthHeight / 2,
            background:
              "radial-gradient(ellipse at 50% 55%, #3a0c10 0%, #3a0c10 45%, #7a2a24 75%, #b04a36 100%)",
            transformOrigin: "50% 35%",
            filter: "blur(0.3px)",
          }}
          initial={false}
          animate={{
            scaleY: mouth.open,
            scaleX: (0.8 + 0.2 * mouth.open) * mouth.wide,
            opacity: Math.min(1, mouth.open * 4),
          }}
          transition={{ duration: mouth.duration, ease: "easeInOut" }}
        >
          <span
            className="absolute left-1/2 top-0 h-[30%] w-[62%] -translate-x-1/2 rounded-b-[50%]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(244,233,228,0.8), rgba(244,233,228,0))",
            }}
          />
        </motion.span>
      </motion.div>
    </div>
  );
}
