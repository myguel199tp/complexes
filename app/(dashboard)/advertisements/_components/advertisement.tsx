import { SelectField, Buton, Text } from "complexes-next-components";
import React from "react";
import { FaPaintRoller } from "react-icons/fa6";
import { IoFilter } from "react-icons/io5";
import {
  MdCarpenter,
  MdElectricalServices,
  MdOutlinePlumbing,
} from "react-icons/md";
import Cardinfo from "./card-advertidement/card-info";

export default function Advertisement() {
  const options = [
    { value: "Bogotá", label: "Bogotá" },
    { value: "Medellin", label: "Medellin" },
    { value: "Cali", label: "Cali" },
  ];

  const iconData = [
    { label: "Carpintero", icon: <MdCarpenter size={25} /> },
    { label: "Plomero", icon: <MdOutlinePlumbing size={25} /> },
    { label: "Electricista", icon: <MdElectricalServices size={25} /> },
    { label: "Pintor", icon: <FaPaintRoller size={25} /> },
  ];

  const imagesSet1 = [
    "https://www.gbdarchitects.com/wp-content/uploads/2013/09/Kiln-Apartments-1.jpg",
  ];

  const imagesSet2 = [
    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2",
  ];
  const imagesSet3 = [
    "https://www.gbdarchitects.com/wp-content/uploads/2013/09/Kiln-Apartments-1.jpg",
  ];
  const imagesSet4 = [
    "https://www.gbdarchitects.com/wp-content/uploads/2013/09/Kiln-Apartments-1.jpg",
  ];
  const imagesSet5 = [
    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2",
  ];

  return (
    <div>
      <section className="sticky top-0 z-10 bg-gray-400 rounded-xl">
        <div className=" flex justify-center gap-12 ">
          <SelectField
            className="mt-2"
            options={options}
            inputSize="full"
            defaultOption="Ciudad"
          />
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
