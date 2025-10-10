import { FaBuilding, FaHome } from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import {
  MdBedroomParent,
  MdLocalConvenienceStore,
  MdOutlineApartment,
  MdOutlineSpaceDashboard,
} from "react-icons/md";
import { SiLibreofficecalc } from "react-icons/si";

export const iconData = [
  {
    id: "5",
    label: "Apartamento",
    icon: <FaBuilding size={25} className="text-white" />,
  },
  {
    id: "7",
    label: "Casa",
    icon: <FaHome size={25} className="text-white" />,
  },
  {
    id: "6",
    label: "Local",
    icon: <FaShop size={25} className="text-white" />,
  },
  {
    id: "4",
    label: "Oficina",
    icon: <SiLibreofficecalc size={25} className="text-white" />,
  },
  {
    id: "1",
    label: "Bodega",
    icon: <MdLocalConvenienceStore size={25} className="text-white" />,
  },
  {
    id: "3",
    label: "Lote",
    icon: <MdOutlineSpaceDashboard size={25} className="text-white" />,
  },
  {
    id: "2",
    label: "Dormitorio",
    icon: <MdBedroomParent size={25} className="text-white" />,
  },
  {
    id: "8",
    label: "Aparta estudio",
    icon: <MdOutlineApartment size={25} className="text-white" />,
  },
];
