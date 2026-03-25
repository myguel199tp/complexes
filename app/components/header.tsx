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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-cyan-800/90 shadow-lg p-3 rounded-md w-full">
      {/* BOTONES */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Tooltip content={tooltip} className="bg-gray-200" position="right">
          <div
            className="bg-white/20 flex justify-center sm:justify-start p-2 rounded-lg cursor-pointer gap-2 items-center text-white hover:bg-white/30 transition w-full sm:w-auto"
            onClick={handleClick}
          >
            {icon}
            {idicative && <span className="text-sm">{idicative}</span>}
          </div>
        </Tooltip>

        {idicativeb && (
          <Tooltip content={tooltipb} className="bg-gray-200" position="right">
            <div
              className="bg-white/20 flex justify-center sm:justify-start p-2 rounded-lg cursor-pointer gap-2 items-center text-white hover:bg-white/30 transition w-full sm:w-auto"
              onClick={handleClickb}
            >
              {iconb}
              <span className="text-sm">{idicativeb}</span>
            </div>
          </Tooltip>
        )}
      </div>

      {/* TITULO */}
      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
        <Text size="md" font="bold" colVariant="on">
          {title}
        </Text>

        {iconc && (
          <div className="bg-white/20 p-2 rounded-full cursor-pointer">
            {iconc}
          </div>
        )}
      </div>
    </div>
  );
};
