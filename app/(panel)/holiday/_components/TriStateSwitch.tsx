"use client";
import React from "react";
import { IconType } from "react-icons";

export type TriState = true | false | undefined;

interface TriStateSwitchProps {
  name: string;
  value: TriState;
  onChange: (name: string, value: TriState) => void;
  Icon: IconType;
}

export const TriStateSwitch: React.FC<TriStateSwitchProps> = ({
  name,
  value,
  onChange,
  Icon,
}) => {
  const nextState = () => {
    if (value === undefined) return true;
    if (value === true) return false;
    return undefined;
  };

  const bgColor =
    value === undefined
      ? "bg-gray-600"
      : value === true
      ? "bg-green-600"
      : "bg-red-600";

  const circlePosition =
    value === undefined
      ? "left-[calc(50%-16px)]"
      : value === true
      ? "right-1"
      : "left-1";

  return (
    <button
      type="button"
      onClick={() => onChange(name, nextState())}
      className={`relative w-20 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${bgColor}`}
    >
      <div
        className={`absolute w-8 h-8 bg-white rounded-full shadow-md transition-all duration-300 ${circlePosition}`}
      ></div>

      <Icon className="text-white text-xl z-10" />
    </button>
  );
};
