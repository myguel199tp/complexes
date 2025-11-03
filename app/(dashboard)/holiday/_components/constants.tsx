import { FaBuilding, FaHome } from "react-icons/fa";
import { PiFarmFill } from "react-icons/pi";
import { MdBedroomParent } from "react-icons/md";
import { useTranslation } from "react-i18next";

// Hook personalizado para obtener iconData con traducciones
export const useIconData = () => {
  const { t } = useTranslation();

  return [
    {
      label: t("propiedades.Apartamento"),
      icon: <FaBuilding size={15} className="text-white" />,
      subOptions: [
        { value: 18, title: t("propiedades.Apartamento") },
        { value: 13, title: t("propiedades.Penthouse") },
        { value: 16, title: t("propiedades.Loft") },
        { value: 19, title: t("propiedades.Estudio") },
        { value: 12, title: "Duplex" },
      ],
    },
    {
      label: t("propiedades.Casa"),
      icon: <FaHome size={15} className="text-white" />,
      subOptions: [
        { value: 20, title: t("propiedades.Casa") },
        { value: 22, title: t("propiedades.Casadecampo") },
        { value: 10, title: t("propiedades.Casapequeña") },
        { value: 23, title: t("propiedades.Casarural") },
        { value: 3, title: t("propiedades.Casaenarbol") },
        { value: 17, title: t("propiedades.Casarodante") },
        { value: 25, title: t("propiedades.Casacueva") },
        { value: 4, title: t("propiedades.Chalet") },
        { value: 11, title: t("propiedades.Villa") },
        { value: 9, title: "Riads" },
      ],
    },
    {
      label: t("propiedades.Finca"),
      icon: <PiFarmFill size={15} className="text-white" />,
      subOptions: [
        { value: 1, title: t("propiedades.Finca") },
        { value: 5, title: t("propiedades.Ecogranja") },
        { value: 7, title: t("propiedades.Hacienda") },
      ],
    },
    {
      label: t("propiedades.Alternativos"),
      icon: <MdBedroomParent size={15} className="text-white" />,
      subOptions: [
        { value: 21, title: t("propiedades.Glamping") },
        { value: 24, title: t("propiedades.Bungalow") },
        { value: 6, title: t("propiedades.Tipis") },
        { value: 8, title: t("propiedades.Yutras") },
        { value: 14, title: t("propiedades.Ecolodges") },
      ],
    },
    {
      label: t("propiedades.Compartidos"),
      icon: <MdBedroomParent size={15} className="text-white" />,
      subOptions: [
        { value: 15, title: t("propiedades.Habitacion") },
        { value: 2, title: t("propiedades.Posada") },
      ],
    },
    {
      label: t("propiedades.ViviendaMovil"),
      icon: <MdBedroomParent size={15} className="text-white" />,
      subOptions: [
        { value: 26, title: t("propiedades.Campistas") },
        { value: 27, title: t("propiedades.Autocaravana") },
        { value: 28, title: t("propiedades.Barcos") },
        { value: 29, title: t("propiedades.Veleros") },
        { value: 30, title: t("propiedades.Yates") },
        { value: 31, title: t("propiedades.Rodante") },
      ],
    },
  ];
};
