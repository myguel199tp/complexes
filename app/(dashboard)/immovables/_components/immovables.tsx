"use client";
import {
  SelectField,
  Buton,
  InputField,
  Text,
  Tooltip,
} from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { FaBuilding, FaHome } from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { IoFilter } from "react-icons/io5";
import {
  MdBedroomParent,
  MdLocalConvenienceStore,
  MdOutlineApartment,
  MdOutlineSpaceDashboard,
} from "react-icons/md";
import { PiFarmFill } from "react-icons/pi";
import { SiLibreofficecalc } from "react-icons/si";
import Cardinfo from "./card-immovables/card-info";
import { InmovableResponses } from "../services/response/inmovableResponses";
import { immovableService } from "../services/inmovableService";
import ModalInmovables from "./Modal/modal-immovables";

export default function Immovables() {
  const [showSkill, setShowSkill] = useState<boolean>(false);

  const openModal = () => {
    setShowSkill(true);
  };

  const closeModal = () => {
    setShowSkill(false);
  };
  const [data, setData] = useState<InmovableResponses[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await immovableService();
        setData(result);
      } catch (err) {
        setError(err);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  const options = [
    { value: "Bogotá", label: "Bogotá" },
    { value: "Medellin", label: "Medellin" },
    { value: "Cali", label: "Cali" },
  ];

  const iconData = [
    {
      label: "Apartamento",
      icon: <FaBuilding size={25} className="text-white" />,
    },
    { label: "Casa", icon: <FaHome size={25} className="text-white" /> },
    { label: "Granja", icon: <PiFarmFill size={25} className="text-white" /> },
    { label: "Local", icon: <FaShop size={25} className="text-white" /> },
    {
      label: "Oficina",
      icon: <SiLibreofficecalc size={25} className="text-white" />,
    },
    {
      label: "Bodega",
      icon: <MdLocalConvenienceStore size={25} className="text-white" />,
    },
    {
      label: "lote",
      icon: <MdOutlineSpaceDashboard size={25} className="text-white" />,
    },
    {
      label: "Dormitorio",
      icon: <MdBedroomParent size={25} className="text-white" />,
    },
    {
      label: "Aparta estudio",
      icon: <MdOutlineApartment size={25} className="text-white" />,
    },
    {
      label: "Edificio",
      icon: <HiBuildingOffice2 size={25} className="text-white" />,
    },
  ];

  const imagesSet1 = [
    "https://www.gbdarchitects.com/wp-content/uploads/2013/09/Kiln-Apartments-1.jpg",
  ];

  return (
    <div>
      <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl">
        <div className=" flex justify-center gap-12 ">
          <SelectField
            className="mt-2"
            options={options}
            inputSize="md"
            defaultOption="Ciudad"
          />
          <Buton
            size="md"
            rounded="lg"
            className="hover:bg-gray-500 mt-2"
            onClick={() => openModal()}
          >
            <div className="flex gap-1 cursor-pointer">
              <IoFilter size={20} className="text-white" />
              <Text className="text-white" size="sm">
                Filtros
              </Text>
            </div>
          </Buton>
        </div>
        <div className="p-5">
          <InputField placeholder="Buscar" rounded="lg" />
        </div>
        <div
          className=" grid 
          grid-cols-10 
          gap-6 
          mt-1
          overflow-x-auto 
          md:overflow-x-visible 
          whitespace-nowrap 
          scroll-smooth"
        >
          {iconData.map((item, index) => (
            <>
              <Tooltip content={item.label}>
                <div
                  key={index}
                  className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 p-2 rounded-lg"
                >
                  {item.icon}
                </div>
              </Tooltip>
            </>
          ))}
        </div>
      </section>
      <div className="grid grid-cols-1 md:!grid-cols-4 gap-2 h-screen mt-4">
        {data.map((e) => (
          <Cardinfo
            key={e._id}
            area={e.area}
            images={imagesSet1}
            city={e.city}
            neighborhood={e.neighborhood}
            ofert={e.ofert === "1" ? "Venta" : "Arriendo"}
            parking={e.parking}
            price={e.price}
            restroom={e.restroom}
            room={e.room}
          />
        ))}{" "}
      </div>
      {showSkill && (
        <ModalInmovables title="Filtros" isOpen onClose={closeModal} />
      )}
    </div>
  );
}
