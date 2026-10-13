import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// Garantiza que la instancia i18n de la app esté inicializada para los tKey*
import "@/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FieldSize = "xxs" | "xs" | "sm" | "md" | "lg" | "full";
export type FieldRounded = "basic" | "sm" | "md" | "lg";
export type HelpSize = "xxs" | "xs" | "sm" | "md" | "lg";

export const roundedClassMap: Record<FieldRounded, string> = {
  basic: "rounded-none",
  sm: "rounded-2xl",
  md: "rounded-3xl",
  lg: "rounded-[28px]",
};

/** Texto del valor escrito / elegido según el tamaño del campo. */
export const valueTextMap: Record<FieldSize, string> = {
  xxs: "text-[10px]",
  xs: "text-xs",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  full: "text-base",
};

/** Etiqueta externa (`label`). */
export const labelClass =
  "block mb-1.5 ml-3 text-sm font-semibold text-cyan-700";

/**
 * Caja común de los tres campos: blanca, con el tinte cian en borde y sombra
 * (sin grises). `ui-field` es el gancho para los ajustes por superficie que
 * viven en globals.css (p. ej. el chat oscuro).
 */
export function fieldShellClass({
  hasError,
  disabled,
  active,
}: {
  hasError?: boolean;
  disabled?: boolean;
  active?: boolean;
}) {
  return cn(
    "ui-field w-full bg-white border border-cyan-100 shadow-[0_4px_16px_-6px_rgba(8,145,178,0.22)] transition-[border-color,box-shadow,background-color] duration-200",
    !disabled && "hover:border-cyan-300",
    "focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-400/20",
    active && "border-cyan-500 ring-4 ring-cyan-400/20",
    hasError &&
      "border-rose-300 bg-rose-50/60 hover:border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-400/20",
    hasError && active && "border-rose-500 ring-rose-400/20",
    disabled && "bg-cyan-50/40 opacity-60 cursor-not-allowed",
  );
}

/** Lista desplegable de los select. */
export const dropdownClass =
  "absolute top-full left-0 z-50 mt-2 w-full max-h-64 overflow-y-auto rounded-3xl border border-cyan-100 bg-white p-1.5 shadow-[0_20px_45px_-15px_rgba(8,47,73,0.35)]";

export const optionSizeClassMap: Record<FieldSize, string> = {
  xxs: "px-2 py-1 text-[10px]",
  xs: "px-2.5 py-1.5 text-xs",
  sm: "px-3 py-1.5 text-xs",
  md: "px-3.5 py-2.5 text-sm",
  lg: "px-4 py-3 text-base",
  full: "px-4 py-3 text-base",
};

export const optionClass =
  "flex items-center gap-3 rounded-2xl cursor-pointer text-cyan-950 transition-colors hover:bg-cyan-50";
export const optionSelectedClass =
  "bg-cyan-100/70 text-cyan-900 font-semibold hover:bg-cyan-100";

export type RegexType =
  | "number"
  | "letters"
  | "alphanumeric"
  | "custom"
  | "customRegex"
  | "email"
  | "phone"
  | "postal"
  | "uppercase"
  | "lowercase"
  | "decimal"
  | "time"
  | "strongPassword"
  | "url"
  | "hexColor"
  | "currency"
  | "fullname"
  | "safeChars";

// Caracteres permitidos mientras se escribe un correo
export const EMAIL_ALLOWED = /^[A-Za-z0-9@._-]+$/;
// Correo completo
export const EMAIL_FULL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const REGEX_MAP: Record<string, RegExp> = {
  number: /^[0-9]*$/,
  letters: /^[A-Za-záéíóúÁÉÍÓÚñÑ ]*$/,
  alphanumeric: /^[A-Za-z0-9áéíóúÁÉÍÓÚñÑ ]*$/,
  email: EMAIL_FULL,
  phone: /^[0-9+\-() ]*$/,
  postal: /^[A-Za-z0-9 ]*$/,
  id: /^[A-Za-z0-9]*$/,
  uppercase: /^[A-ZÁÉÍÓÚÑ ]*$/,
  lowercase: /^[a-záéíóúñ ]*$/,
  decimal: /^[0-9]+(\.[0-9]*)?$/,
  time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&.,\-+_]{8,}$/,
  url: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/,
  hexColor: /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  currency: /^\$?\d+(,\d{3})*(\.\d{1,2})?$/,
  fullname: /^[A-Za-záéíóúÁÉÍÓÚñÑ ]{2,}$/,
  safeChars: /^[A-Za-z0-9áéíóúÁÉÍÓÚñÑ.,;:!?\-() ]*$/,
};

/** Regex a aplicar según el tipo; `custom`/`customRegex` usan la que llega por props. */
export function resolveRegex(
  regexType?: RegexType,
  customRegex?: RegExp,
): RegExp | undefined {
  if (!regexType) return undefined;
  if (regexType === "custom" || regexType === "customRegex") return customRegex;
  return REGEX_MAP[regexType];
}

export interface Option {
  value: string;
  label: string;
  tKeyLabel?: string;
  icon?: React.ReactNode;
  image?: string;
}
