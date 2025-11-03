import { useTranslation } from "react-i18next";
import { FaBuilding, FaHome } from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import {
  MdBedroomParent,
  MdLocalConvenienceStore,
  MdOutlineApartment,
  MdOutlineSpaceDashboard,
} from "react-icons/md";
import { SiLibreofficecalc } from "react-icons/si";

export const useIconDataInmovable = () => {
  const { t } = useTranslation();

  return [
    {
      id: "5",
      label: t("apartamento"),
      icon: <FaBuilding size={25} className="text-white" />,
    },
    {
      id: "7",
      label: t("casa"),
      icon: <FaHome size={25} className="text-white" />,
    },
    {
      id: "6",
      label: t("local"),
      icon: <FaShop size={25} className="text-white" />,
    },
    {
      id: "4",
      label: t("oficina"),
      icon: <SiLibreofficecalc size={25} className="text-white" />,
    },
    {
      id: "1",
      label: t("bodega"),
      icon: <MdLocalConvenienceStore size={25} className="text-white" />,
    },
    {
      id: "3",
      label: t("lote"),
      icon: <MdOutlineSpaceDashboard size={25} className="text-white" />,
    },
    {
      id: "2",
      label: t("dormitorio"),
      icon: <MdBedroomParent size={25} className="text-white" />,
    },
    {
      id: "8",
      label: t("aparta"),
      icon: <MdOutlineApartment size={25} className="text-white" />,
    },
  ];
};
