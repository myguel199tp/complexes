"use client";

import { motion, useReducedMotion } from "framer-motion";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

interface Props {
  state: OrbState;
  /** Volumen del micrófono (0-1). Solo se usa en estado `listening`. */
  level?: number;
  size?: number;
}

/**
 * Núcleo visual del asistente.
 *
 * Sustituye al icono de robot estático: es el elemento que comunica, sin una
 * sola palabra, que el asistente está oyendo, pensando o hablando. Un avatar
 * fijo obliga a leer un texto de estado para saberlo; el orbe se ve de reojo.
 *
 * Respeta `prefers-reduced-motion`: quien tenga desactivadas las animaciones
 * del sistema recibe el orbe quieto con los mismos colores por estado. El
 * movimiento continuo es justo lo que esa preferencia existe para evitar.
 */
export default function AssistantOrb({ state, level = 0, size = 40 }: Props) {
  const reduceMotion = useReducedMotion();

  const palette: Record<OrbState, { from: string; to: string; glow: string }> = {
    idle: { from: "#4f46e5", to: "#0ea5e9", glow: "rgba(79,70,229,0.45)" },
    listening: { from: "#06b6d4", to: "#22d3ee", glow: "rgba(34,211,238,0.55)" },
    thinking: { from: "#6366f1", to: "#a855f7", glow: "rgba(168,85,247,0.5)" },
    speaking: { from: "#0ea5e9", to: "#38bdf8", glow: "rgba(56,189,248,0.55)" },
  };

  const colors = palette[state];

  // Escuchando, el tamaño lo dicta la voz. En el resto de estados no hay señal
  // externa que seguir, así que la escala la marca la animación.
  const listeningScale = 1 + level * 0.35;

  const coreAnimation = reduceMotion
    ? { scale: 1 }
    : {
        idle: { scale: [1, 1.06, 1] },
        listening: { scale: listeningScale },
        thinking: { scale: [1, 1.12, 1] },
        speaking: { scale: [1, 1.09, 1] },
      }[state];

  const coreTransition = reduceMotion
    ? { duration: 0 }
    : {
        idle: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
        // Sin repetición: cada nuevo valor de volumen es un destino distinto y
        // la transición corta hace que el orbe siga la voz en vez de latir.
        listening: { duration: 0.12, ease: "easeOut" as const },
        thinking: { duration: 1.1, repeat: Infinity, ease: "easeInOut" as const },
        speaking: { duration: 0.5, repeat: Infinity, ease: "easeInOut" as const },
      }[state];

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Halo exterior: da la sensación de energía y separa el orbe del fondo */}
      <motion.div
        className="absolute inset-0 rounded-full blur-md"
        style={{ background: colors.glow }}
        animate={
          reduceMotion
            ? { opacity: 0.5 }
            : { opacity: state === "idle" ? [0.35, 0.6, 0.35] : [0.5, 0.9, 0.5] }
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

      {/* Anillo giratorio: solo mientras piensa, para que rotar signifique algo */}
      {state === "thinking" && !reduceMotion ? (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${colors.to} 90deg, transparent 200deg)`,
            maskImage: "radial-gradient(circle, transparent 58%, black 60%)",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 58%, black 60%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />
      ) : null}

      {/* Onda de escucha: se expande hacia fuera al ritmo de la voz */}
      {state === "listening" && !reduceMotion ? (
        <motion.div
          className="absolute inset-0 rounded-full border"
          style={{ borderColor: colors.to }}
          animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />
      ) : null}

      {/* Núcleo */}
      <motion.div
        className="absolute inset-[15%] rounded-full"
        style={{
          background: `radial-gradient(circle at 32% 28%, ${colors.from}, ${colors.to})`,
          boxShadow: `0 0 12px ${colors.glow}`,
        }}
        animate={coreAnimation}
        transition={coreTransition}
      >
        {/* Brillo especular: lo que lo hace leer como esfera y no como círculo */}
        <div className="absolute left-[22%] top-[16%] h-[22%] w-[22%] rounded-full bg-white/70 blur-[1px]" />
      </motion.div>
    </div>
  );
}
