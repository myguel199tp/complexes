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

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200 dark:border-cyan-400/20 shadow-sm dark:shadow-[0_0_25px_rgba(34,211,238,0.12)] p-2 rounded-xl w-full overflow-hidden">
      {/* BOTONES */}
      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
        {(icon || idicative) && (
          <Tooltip
            content={tooltip}
            className="bg-slate-800 text-white"
            position="right"
          >
            <div
              className="bg-slate-900/5 border border-slate-200 text-slate-700 hover:bg-slate-900/10 dark:bg-white/10 dark:border-white/10 dark:text-white dark:hover:bg-white/20 flex items-center justify-center sm:justify-start gap-2 transition rounded-lg p-2 cursor-pointer w-full sm:w-auto min-w-0"
              onClick={handleClick}
            >
              <div className={`shrink-0 ${ICON_COLOR}`}>{icon}</div>

              {idicative && (
                <span className="text-sm break-words">{idicative}</span>
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
              className="bg-slate-900/5 border border-slate-200 text-slate-700 hover:bg-slate-900/10 dark:bg-white/10 dark:border-white/10 dark:text-white dark:hover:bg-white/20 flex items-center justify-center sm:justify-start gap-2 transition rounded-lg p-2 cursor-pointer w-full sm:w-auto min-w-0"
              onClick={handleClickb}
            >
              <div className={`shrink-0 ${ICON_COLOR}`}>{iconb}</div>

              <span className="text-sm break-words">{idicativeb}</span>
            </div>
          </Tooltip>
        )}
      </div>

      {/* TITULO */}
      <div className="flex items-center justify-center lg:justify-end gap-2 w-full lg:w-auto min-w-0">
        <div className="min-w-0">
          <Text
            size="md"
            font="bold"
            className="break-words text-center lg:text-right block text-slate-800 dark:text-white"
          >
            {title}
          </Text>
        </div>

        {iconc && (
          <div
            className={`bg-slate-900/5 border border-slate-200 hover:bg-slate-900/10 dark:bg-white/10 dark:border-white/10 dark:hover:bg-white/20 p-2 rounded-full cursor-pointer shrink-0 transition ${ICON_COLOR}`}
          >
            {iconc}
          </div>
        )}
      </div>
    </div>
  );
};
