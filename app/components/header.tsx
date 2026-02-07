"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Title, Tooltip } from "complexes-next-components";

interface HeaderActionProps {
  title: string;
  tooltip: string;
  icon: React.ReactNode;
  onClick?: () => void;
  route?: string;
  iconc: React.ReactNode;
}

export const HeaderAction: React.FC<HeaderActionProps> = ({
  title,
  tooltip,
  icon,
  onClick,
  route,
  iconc,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) return onClick();
    if (route) return router.push(route);
  };

  return (
    <div className="flex items-center justify-between gap-2 bg-cyan-800/90 shadow-lg p-2 rounded-md w-full">
      <Tooltip content={tooltip} className="bg-gray-200" position="right">
        <div
          className="bg-white/20 p-2 rounded-full cursor-pointer hover:bg-white/30 transition"
          onClick={handleClick}
        >
          {icon}
        </div>
      </Tooltip>

      <div className="flex gap-2 items-center">
        <Title size="sm" font="bold" colVariant="on">
          {title}
        </Title>
        <div className="bg-white/20 p-2 rounded-full cursor-pointer">
          {iconc}
        </div>
      </div>
    </div>
  );
};
