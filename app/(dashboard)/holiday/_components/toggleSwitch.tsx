"use client";
import React from "react";
import { Tooltip, Buton } from "complexes-next-components";

interface ToggleSwitchProps<T extends Record<string, string>> {
  value: string;
  name: keyof T;
  onToggle: (key: keyof T) => void;
  trueText: string;
  falseText: string;
  Icon: React.ElementType;
}

export const ToggleSwitch = <T extends Record<string, string>>({
  value,
  name,
  onToggle,
  trueText,
  falseText,
  Icon,
}: ToggleSwitchProps<T>) => {
  const isTrue = value === "true";
  const isFalse = value === "false";

  return (
    <Tooltip
      content={isTrue ? trueText : falseText}
      position="left"
      className="bg-gray-300"
    >
      <Buton
        onClick={() => onToggle(name)}
        borderWidth="none"
        className={`relative w-14 h-6 flex items-center rounded-full transition-colors duration-300 ${
          isTrue ? "bg-cyan-800" : isFalse ? "bg-gray-500" : "bg-gray-700"
        }`}
      >
        <span
          className={`absolute flex items-center justify-center left-1 w-5 h-5 rounded-full bg-white transform transition-transform duration-300 ${
            isTrue ? "translate-x-5" : "translate-x-0"
          }`}
        >
          <Icon
            className={`transition-colors duration-300 ${
              isTrue ? "text-cyan-800" : "text-gray-500"
            }`}
            size={14}
          />
        </span>
      </Buton>
    </Tooltip>
  );
};
