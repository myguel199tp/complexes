"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { OrbState } from "./assistant-orb";

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
 * que se abre y se cierra. La API de voz del navegador no expone la amplitud
 * del audio, de modo que el ritmo es aleatorio dentro de la cadencia del habla:
 * no sigue las sílabas, pero empieza y termina exactamente con la voz.
 *
 * Con `prefers-reduced-motion` queda quieta; el color del halo sigue diciendo
 * en qué estado está.
 */

/** Centro de la boca en la ilustración, en fracción del lado de la imagen. */
const MOUTH = { x: 0.557, y: 0.523, width: 0.06, height: 0.034 };

const GLOW: Record<OrbState, string> = {
  idle: "rgba(79,70,229,0.45)",
  listening: "rgba(34,211,238,0.6)",
  thinking: "rgba(168,85,247,0.55)",
  speaking: "rgba(56,189,248,0.6)",
};

export default function LaryAvatar({ state, level = 0, size = 240 }: Props) {
  const reduceMotion = useReducedMotion();
  const [mouth, setMouth] = useState(0);

  // Boca: abre y cierra a ritmo de habla solo mientras suena la voz.
  useEffect(() => {
    if (state !== "speaking" || reduceMotion) {
      setMouth(0);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    const open = () => {
      setMouth(0.35 + Math.random() * 0.65);
      timer = setTimeout(close, 90 + Math.random() * 120);
    };

    const close = () => {
      setMouth(0.08);
      timer = setTimeout(open, 50 + Math.random() * 90);
    };

    open();
    return () => clearTimeout(timer);
  }, [state, reduceMotion]);

  const head = reduceMotion
    ? { animate: { rotate: 0, y: 0, scale: 1 }, transition: { duration: 0 } }
    : {
        idle: {
          animate: { rotate: [0, 0.8, 0], y: [0, -3, 0], scale: 1 },
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
        },
        speaking: {
          animate: {
            rotate: [-2.5, 2, -1.5, 2.5, -2.5],
            y: [0, -4, 0, -2, 0],
            scale: 1.02,
          },
          transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" as const },
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
                duration: state === "idle" ? 4 : state === "speaking" ? 0.6 : 1.2,
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

        <motion.span
          aria-hidden="true"
          className="absolute rounded-[50%]"
          style={{
            left: `${MOUTH.x * 100}%`,
            top: `${MOUTH.y * 100}%`,
            width: size * MOUTH.width,
            height: size * MOUTH.height,
            marginLeft: -(size * MOUTH.width) / 2,
            marginTop: -(size * MOUTH.height) / 2,
            background:
              "radial-gradient(ellipse at 50% 35%, #2a0a0e 0%, #5c1a24 60%, #b85c5c 100%)",
            transformOrigin: "50% 30%",
          }}
          animate={{ scaleY: mouth, opacity: mouth > 0.1 ? 0.92 : 0 }}
          transition={{ duration: 0.08, ease: "easeOut" }}
        />
      </motion.div>
    </div>
  );
}
