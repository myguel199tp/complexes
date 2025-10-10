import { FaBuilding, FaHome } from "react-icons/fa";
import { PiFarmFill } from "react-icons/pi";
import { MdBedroomParent } from "react-icons/md";

export const iconData = [
  {
    label: "Apartamento",
    icon: <FaBuilding size={25} className="text-white" />,
    subOptions: [
      { value: 1, title: "Apartamento" },
      { value: 2, title: "Penthouse" },
      { value: 3, title: "Loft" },
      { value: 4, title: "Estudio" },
      { value: 5, title: "Duplex" },
    ],
  },
  {
    label: "Casa",
    icon: <FaHome size={25} className="text-white" />,
    subOptions: [
      { value: 6, title: "Casa" },
      { value: 7, title: "Casa de campo" },
      { value: 8, title: "Casa pequeña" },
      { value: 9, title: "Casa rural" },
      { value: 10, title: "Casa en árbol" },
      { value: 11, title: "Casa rodante" },
      { value: 12, title: "Casa cueva" },
      { value: 13, title: "Chalet" },
      { value: 14, title: "Villa" },
      { value: 15, title: "Riads" },
    ],
  },
  {
    label: "Granja",
    icon: <PiFarmFill size={25} className="text-white" />,
    subOptions: [
      { value: 16, title: "Finca" },
      { value: 17, title: "Eco-granja" },
      { value: 18, title: "Hacienda" },
    ],
  },
  {
    label: "Alternativos",
    icon: <MdBedroomParent size={25} className="text-white" />,
    subOptions: [
      { value: 19, title: "Glamping" },
      { value: 20, title: "Bungalow" },
      { value: 21, title: "Tipis" },
      { value: 22, title: "Yutras" },
      { value: 23, title: "Eco-lodges" },
    ],
  },
  {
    label: "Compartidos",
    icon: <MdBedroomParent size={25} className="text-white" />,
    subOptions: [
      { value: 24, title: "Habitación" },
      { value: 25, title: "Posada" },
    ],
  },
  {
    label: "Vivienda móvil",
    icon: <MdBedroomParent size={25} className="text-white" />,
    subOptions: [
      { value: 26, title: "Campers" },
      { value: 27, title: "Autocaravana" },
      { value: 28, title: "Barcos" },
      { value: 29, title: "Veleros" },
      { value: 30, title: "Yates" },
      { value: 31, title: "Rodante" },
    ],
  },
];
