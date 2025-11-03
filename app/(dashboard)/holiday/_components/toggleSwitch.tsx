"use client";
import React from "react";
import { Tooltip, Buton } from "complexes-next-components";

interface ToggleSwitchProps<T extends Record<string, string>> {
  value?: string | null; // ahora puede ser "true", "false" o vacío
  name: keyof T;
  onToggle: (key: keyof T, newValue: string | null) => void;
  trueText: string;
  falseText: string;
  Icon: React.ElementType;
}

export const TriStateToggleSwitch = <T extends Record<string, string>>({
  value,
  name,
  onToggle,
  trueText,
  falseText,
  Icon,
}: ToggleSwitchProps<T>) => {
  // detectar el estado actual
  const isTrue = value === "true";
  const isFalse = value === "false";
  const isEmpty = !isTrue && !isFalse;

  // calcular el próximo estado en secuencia
  const nextState = () => {
    if (isEmpty) return "true"; // empieza activando
    if (isTrue) return "false"; // luego desactiva
    return null; // vuelve al estado vacío (sin filtro)
  };

  // colores según estado
  const bgColor = isTrue
    ? "bg-green-600"
    : isFalse
    ? "bg-red-600"
    : "bg-gray-600";

  // posición del círculo
  const position = isTrue
    ? "translate-x-8"
    : isFalse
    ? "translate-x-0"
    : "translate-x-4"; // centro

  const tooltipText = isTrue ? trueText : isFalse ? falseText : "Mostrar todos";

  return (
    <Tooltip content={tooltipText} position="top" className="bg-gray-200">
      <Buton
        onClick={() => onToggle(name, nextState())}
        borderWidth="none"
        className={`relative w-20 h-8 flex items-center rounded-full transition-all duration-300 ${bgColor}`}
      >
        {/* círculo */}
        <span
          className={`absolute left-1 flex items-center justify-center w-6 h-6 rounded-full bg-white transform transition-transform duration-300 ${position}`}
        >
          <Icon
            className={`transition-colors duration-300 ${
              isTrue
                ? "text-green-700"
                : isFalse
                ? "text-red-700"
                : "text-gray-500"
            }`}
            size={16}
          />
        </span>
      </Buton>
    </Tooltip>
  );
};
