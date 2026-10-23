"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Text, Tooltip } from "complexes-next-components";

interface HeaderActionProps {
  title?: string;
  onClick?: () => void;
  onClickb?: () => void;
  route?: string;
  iconc?: React.ReactNode;
  tooltip?: string;
  icon?: React.ReactNode;
  idicative?: string;
  tooltipb?: string;
  iconb?: React.ReactNode;
  idicativeb?: string;
}

/**
 * Las páginas pasan sus iconos con `color="white"`, y react-icons lo aplica
 * como estilo en línea: en tema claro el icono queda blanco sobre un botón
 * claro y desaparece. Cambiarlo en las 52 pantallas que lo hacen rompería los
 * iconos que sí van sobre fondo de color, así que el color se impone aquí —el
 * `!` de Tailwind genera `!important`, que es lo único que gana a un estilo en
 * línea— y cada página se despreocupa del tema.
 */
const ICON_COLOR = "[&_svg]:!text-slate-700 dark:[&_svg]:!text-white";
const PRIMARY_ICON_COLOR = "[&_svg]:!text-cyan-700 dark:[&_svg]:!text-cyan-300";

/**
 * Los bordes oscuros van en slate y no en `white/*`: globals.css pinta de
 * blanco todo `border-white/*` que esté dentro de un `bg-*` en tema claro, y
 * sobre esta cabecera el borde desaparecía.
 */
const BUTTON_BASE =
  "flex items-center gap-2 rounded-full border pl-1 pr-3 py-1 sm:pr-4 cursor-pointer min-w-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm";
const BUTTON_PRIMARY =
  "bg-cyan-50 border-cyan-200 text-cyan-900 hover:bg-cyan-100 dark:bg-cyan-400/10 dark:border-cyan-400/30 dark:text-cyan-50 dark:hover:bg-cyan-400/20";
const BUTTON_SECONDARY =
  "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-white/10 dark:border-slate-400/20 dark:text-white dark:hover:bg-white/20";

/** Las páginas pasan iconos de 22 a 34px; aquí se igualan dentro del círculo. */
const ICON_BADGE =
  "flex items-center justify-center shrink-0 size-7 sm:size-8 rounded-full bg-white shadow-sm dark:bg-white/10 [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-[18px] sm:[&_svg]:w-[18px]";

export const HeaderAction: React.FC<HeaderActionProps> = ({
  title,
  icon,
  onClick,
  onClickb,
  route,
  tooltip,
  iconc,
  idicative,
  tooltipb,
  iconb,
  idicativeb,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) return onClick();
    if (route) return router.push(route);
  };

  const handleClickb = () => {
    if (onClickb) return onClickb();
    if (route) return router.push(route);
  };

  /**
   * Por debajo de `lg` todo va en una sola fila: apilar el título encima de un
   * botón a todo el ancho se comía media pantalla en móvil. El título va
   * después de los botones en el marcado, así que `flex-row-reverse` lo deja a
   * la izquierda (y se parte en líneas si no cabe) con los botones a la
   * derecha; en `lg:flex-row` vuelve a ser botones a la izquierda y título a la
   * derecha.
   */
  return (
    <div className="flex flex-row-reverse lg:flex-row items-center justify-between gap-2 lg:gap-4 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white/90 via-white/80 to-cyan-50/70 p-2 sm:px-3 lg:py-2.5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-cyan-400/20 dark:from-white/[0.07] dark:via-white/[0.04] dark:to-cyan-400/[0.07] dark:shadow-[0_0_25px_rgba(34,211,238,0.12)]">
      {/* BOTONES */}
      <div className="flex flex-col sm:flex-row gap-2 shrink-0 max-w-[55%] sm:max-w-none">
        {(icon || idicative) && (
          <Tooltip
            content={tooltip}
            className="bg-slate-800 text-white"
            position="right"
          >
            <div
              className={`${BUTTON_BASE} ${BUTTON_PRIMARY}`}
              onClick={handleClick}
              data-guide="primary-action"
            >
              <div className={`${ICON_BADGE} ${PRIMARY_ICON_COLOR}`}>
                {icon}
              </div>

              {idicative && (
                <span className="text-xs sm:text-sm font-medium leading-tight break-words">
                  {idicative}
                </span>
              )}
            </div>
          </Tooltip>
        )}

        {idicativeb && (
          <Tooltip
            content={tooltipb}
            className="bg-slate-800 text-white"
            position="right"
          >
            <div
              className={`${BUTTON_BASE} ${BUTTON_SECONDARY}`}
              onClick={handleClickb}
              data-guide="secondary-action"
            >
              <div className={`${ICON_BADGE} ${ICON_COLOR}`}>{iconb}</div>

              <span className="text-xs sm:text-sm font-medium leading-tight break-words">
                {idicativeb}
              </span>
            </div>
          </Tooltip>
        )}
      </div>

      {/* TITULO */}
      <div className="flex items-center justify-start lg:justify-end gap-2.5 flex-1 min-w-0">
        <span
          aria-hidden
          className="h-6 sm:h-7 w-1 shrink-0 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600"
        />

        <div className="min-w-0">
          <Text
            size="md"
            font="bold"
            className="break-words text-left lg:text-right block tracking-tight text-slate-800 dark:text-white max-sm:!text-base"
          >
            {title}
          </Text>
        </div>

        {iconc && (
          <div
            className={`flex items-center justify-center size-8 sm:size-9 rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 dark:bg-white/10 dark:border-slate-400/20 dark:hover:bg-white/20 cursor-pointer shrink-0 transition [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-[18px] sm:[&_svg]:w-[18px] [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:rotate-90 ${ICON_COLOR}`}
          >
            {iconc}
          </div>
        )}
      </div>
    </div>
  );
};
