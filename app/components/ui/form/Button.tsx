"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "./utils";

/**
 * Botón de la app. Reemplaza a `Button` y `Buton` de complexes-next-components
 * con la misma API (`colVariant`, `size`, `rounded`, `fonts`, `tKey`), así que
 * migrar es cambiar el import.
 *
 * - `variant="solid"` (por defecto): fondo lleno. Era el `Button` de la librería.
 * - `variant="soft"`: fondo tenue del color. Era el `Buton` con `borderWidth="none"`.
 * - `variant="outline"`: borde del color sobre fondo transparente.
 * - `variant="ghost"`: solo texto; el fondo aparece al pasar el cursor.
 * - `colVariant="none"`: botón "pelado" que hereda el color y no pinta nada
 *   (para envolver iconos o contenido que trae su propio estilo).
 *
 * El `className` se fusiona con tailwind-merge: cualquier `bg-*`, `px-*`,
 * `rounded-*`… que se pase gana sobre el del componente, sin `!`.
 */

export type ButtonColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "none";
export type ButtonVariant = "solid" | "soft" | "outline" | "ghost";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "full";
export type ButtonRounded = "basic" | "sm" | "md" | "lg";
export type ButtonFont = "bold" | "semi" | "thin";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  colVariant?: ButtonColor;
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: ButtonRounded;
  fonts?: ButtonFont;
  /** Texto del botón; si es una clave de i18n se traduce, si no se pinta tal cual. */
  tKey?: string;
  /** Muestra un spinner y deshabilita el botón mientras dura la acción. */
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const base =
  "relative inline-flex items-center justify-center gap-2 select-none text-center leading-tight " +
  "transition-all duration-200 ease-out outline-none " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 disabled:scale-100";

// Hundimiento al hacer clic y un leve despegue al pasar el cursor
const motion = "hover:-translate-y-px active:translate-y-0 active:scale-[0.98]";

const focusRing: Record<ButtonColor, string> = {
  default: "focus-visible:outline-slate-400",
  primary: "focus-visible:outline-cyan-500",
  success: "focus-visible:outline-emerald-500",
  warning: "focus-visible:outline-amber-500",
  danger: "focus-visible:outline-rose-500",
  none: "focus-visible:outline-cyan-500",
};

type Tone = Exclude<ButtonColor, "none">;

const tones: Record<ButtonVariant, Record<Tone, string>> = {
  // Fondo lleno. El neutro es blanco con borde: se lee igual sobre el fondo
  // claro, el oscuro del panel y el blanco de los modales.
  solid: {
    default:
      "bg-white text-slate-700 border border-slate-200 shadow-sm shadow-slate-900/5 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900",
    primary:
      "bg-cyan-600 text-white shadow-md shadow-cyan-600/25 hover:bg-cyan-700 hover:shadow-lg hover:shadow-cyan-600/30",
    success:
      "bg-emerald-500 text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30",
    warning:
      "bg-amber-500 text-white shadow-md shadow-amber-500/25 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30",
    danger:
      "bg-rose-500 text-white shadow-md shadow-rose-500/25 hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/30",
  },
  // Fondo tenue. El neutro no pinta fondo y hereda el color del texto, como
  // hacía el Buton de la librería (lo usan los menús).
  soft: {
    default: "bg-transparent hover:bg-slate-500/10",
    primary:
      "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/15 hover:bg-cyan-100 hover:text-cyan-800",
    success:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15 hover:bg-emerald-100 hover:text-emerald-800",
    warning:
      "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 hover:bg-amber-100 hover:text-amber-800",
    danger:
      "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/15 hover:bg-rose-100 hover:text-rose-800",
  },
  // Sin fondo propio: el tono -600 se lee tanto sobre blanco (modales) como
  // sobre el fondo oscuro del panel, y el hover es un velo translúcido.
  outline: {
    default:
      "bg-transparent border border-slate-400/60 hover:bg-slate-500/10 hover:border-slate-400",
    primary:
      "bg-transparent border border-cyan-500/70 text-cyan-600 hover:bg-cyan-500/10",
    success:
      "bg-transparent border border-emerald-500/70 text-emerald-600 hover:bg-emerald-500/10",
    warning:
      "bg-transparent border border-amber-500/70 text-amber-600 hover:bg-amber-500/10",
    danger:
      "bg-transparent border border-rose-500/70 text-rose-600 hover:bg-rose-500/10",
  },
  ghost: {
    default: "bg-transparent hover:bg-slate-500/10",
    primary: "bg-transparent text-cyan-600 hover:bg-cyan-500/10",
    success: "bg-transparent text-emerald-600 hover:bg-emerald-500/10",
    warning: "bg-transparent text-amber-600 hover:bg-amber-500/10",
    danger: "bg-transparent text-rose-600 hover:bg-rose-500/10",
  },
};

const bare = "bg-transparent text-inherit border-0 shadow-none";

const sizes: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-[11px]",
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  full: "w-full px-6 py-3 text-base",
};

const spinnerSizes: Record<ButtonSize, string> = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  full: "h-5 w-5",
};

const roundeds: Record<ButtonRounded, string> = {
  basic: "rounded-none",
  sm: "rounded-lg",
  md: "rounded-2xl",
  lg: "rounded-3xl",
};

const fontsMap: Record<ButtonFont, string> = {
  bold: "font-bold",
  semi: "font-semibold",
  thin: "font-normal",
};

// Un `bg-*` propio en el className (no `hover:bg-*`) significa que el botón
// trae su color: el borde gris del neutro sobraría alrededor.
const OWN_BACKGROUND = /(^|\s)!?bg-/;

function Spinner({ className }: { className: string }) {
  return (
    <svg
      className={cn("animate-spin shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      colVariant = "default",
      variant = "solid",
      size = "md",
      rounded = "md",
      fonts = "semi",
      tKey,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { t, i18n } = useTranslation();

    const isBare = colVariant === "none";
    const tone = isBare
      ? bare
      : variant === "solid" &&
          colVariant === "default" &&
          OWN_BACKGROUND.test(className ?? "")
        ? "bg-white text-slate-700"
        : tones[variant][colVariant];

    const label = tKey ? (i18n.exists(tKey) ? t(tKey) : tKey) : children;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          base,
          !isBare && variant !== "ghost" && motion,
          focusRing[colVariant],
          sizes[size],
          roundeds[rounded],
          fontsMap[fonts],
          tone,
          className,
        )}
        {...props}
      >
        {loading ? <Spinner className={spinnerSizes[size]} /> : leftIcon}
        {label}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";
