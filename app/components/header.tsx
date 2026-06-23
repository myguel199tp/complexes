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
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white/[0.04] backdrop-blur-xl border border-cyan-400/20 shadow-[0_0_25px_rgba(34,211,238,0.12)] p-2 rounded-xl w-full overflow-hidden">
      {/* BOTONES */}
      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
        <Tooltip
          content={tooltip}
          className="bg-slate-800 text-white"
          position="right"
        >
          <div
            className="bg-white/10 border border-white/10 flex items-center justify-center sm:justify-start gap-2 text-white hover:bg-white/20 transition rounded-lg p-2 cursor-pointer w-full sm:w-auto min-w-0"
            onClick={handleClick}
          >
            <div className="shrink-0">{icon}</div>

            {idicative && (
              <span className="text-sm break-words">{idicative}</span>
            )}
          </div>
        </Tooltip>

        {idicativeb && (
          <Tooltip
            content={tooltipb}
            className="bg-slate-800 text-white"
            position="right"
          >
            <div
              className="bg-white/10 border border-white/10 flex items-center justify-center sm:justify-start gap-2 text-white hover:bg-white/20 transition rounded-lg p-2 cursor-pointer w-full sm:w-auto min-w-0"
              onClick={handleClickb}
            >
              <div className="shrink-0">{iconb}</div>

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
            colVariant="on"
            className="break-words text-center lg:text-right block"
          >
            {title}
          </Text>
        </div>

        {iconc && (
          <div className="bg-white/10 border border-white/10 p-2 rounded-full cursor-pointer shrink-0 hover:bg-white/20 transition">
            {iconc}
          </div>
        )}
      </div>
    </div>
  );
};
