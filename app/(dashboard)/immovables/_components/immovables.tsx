import { SelectField, Buton, Text } from "complexes-next-components";
import React from "react";
import { FaBuilding, FaHome, FaMap } from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { IoFilter } from "react-icons/io5";
import {
  MdBedroomParent,
  MdOutlineApartment,
  MdOutlineSpaceDashboard,
} from "react-icons/md";
import { PiFarmFill } from "react-icons/pi";
import { SiLibreofficecalc } from "react-icons/si";
import Cardinfo from "./card-immovables/card-info";

export default function Immovables() {
  const options = [
    { value: "Bogotá", label: "Bogotá" },
    { value: "Medellin", label: "Medellin" },
    { value: "Cali", label: "Cali" },
  ];

  const iconData = [
    { label: "Apartamento", icon: <FaBuilding size={25} /> },
    { label: "Casa", icon: <FaHome size={25} /> },
    { label: "Granja", icon: <PiFarmFill size={25} /> },
    { label: "Local", icon: <FaShop size={25} /> },
    { label: "Oficina", icon: <SiLibreofficecalc size={25} /> },
    { label: "Bodega", icon: <FaMap size={25} /> },
    { label: "lote", icon: <MdOutlineSpaceDashboard size={25} /> },
    { label: "Dormitorio", icon: <MdBedroomParent size={25} /> },
    { label: "Aparta estudio", icon: <MdOutlineApartment size={25} /> },
    { label: "Edificio", icon: <HiBuildingOffice2 size={25} /> },
  ];

  const imagesSet1 = [
    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2",
  ];

  const imagesSet2 = [
    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2",
  ];
  const imagesSet3 = [
    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2",
  ];
  const imagesSet4 = [
    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2",
  ];
  const imagesSet5 = [
    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2",
  ];

  return (
    <div>
      <section className="sticky top-0 z-10 bg-white rounded-xl">
        <div className=" flex justify-center gap-12 ">
          <SelectField className="mt-2" options={options} inputSize="full" />
          <Buton size="md" rounded="lg" className="hover:bg-gray-200">
            <div className="flex gap-3 cursor-pointer">
              <IoFilter size={20} />
              <Text size="sm">Filtros</Text>
            </div>
          </Buton>
        </div>
        <div className="grid grid-cols-10 gap-3 mt-3">
          {iconData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 p-2 rounded-lg"
            >
              {item.icon}
              {item.label && <span className="text-sm">{item.label}</span>}
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-4 gap-2 h-screen mt-4">
        <Cardinfo images={imagesSet1} />
        <Cardinfo images={imagesSet2} />
        <Cardinfo images={imagesSet3} />
        <Cardinfo images={imagesSet4} />
        <Cardinfo images={imagesSet5} />
        <Cardinfo images={imagesSet1} />
        <Cardinfo images={imagesSet2} />
        <Cardinfo images={imagesSet3} />
        <Cardinfo images={imagesSet4} />
        <Cardinfo images={imagesSet5} />
        <Cardinfo images={imagesSet1} />
        <Cardinfo images={imagesSet2} />
        <Cardinfo images={imagesSet3} />
        <Cardinfo images={imagesSet4} />
        <Cardinfo images={imagesSet5} />
      </div>
    </div>
  );
}
