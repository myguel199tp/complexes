"use client";

import { motion } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "zoom";

export default function Reveal({
  children,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
}) {
  const getInitial = () => {
    switch (direction) {
      case "left":
        return { opacity: 0, x: -80 };

      case "right":
        return { opacity: 0, x: 80 };

      case "down":
        return { opacity: 0, y: -80 };

      case "zoom":
        return { opacity: 0, scale: 0.85 };

      default:
        return { opacity: 0, y: 80 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
    >
      {children}
    </motion.div>
  );
}
