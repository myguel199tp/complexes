import { ReactNode } from "react";

interface IconCardProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

const IconCard: React.FC<IconCardProps> = ({
  icon,
  label,
  onClick,
  className,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 p-2 rounded-lg ${className}`}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
};

export default IconCard;
