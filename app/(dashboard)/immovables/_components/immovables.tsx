"use client";
import {
  SelectField,
  Buton,
  InputField,
  Text,
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
  }, []); // El arreglo vacío asegura que esto solo se ejecute una vez cuando el componente se monte.

  if (error) {
    return <div>{error}</div>;
  }

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
    { label: "Bodega", icon: <MdLocalConvenienceStore size={25} /> },
    { label: "lote", icon: <MdOutlineSpaceDashboard size={25} /> },
    { label: "Dormitorio", icon: <MdBedroomParent size={25} /> },
    { label: "Aparta estudio", icon: <MdOutlineApartment size={25} /> },
    { label: "Edificio", icon: <HiBuildingOffice2 size={25} /> },
  ];

  const imagesSet1 = [
    "https://www.gbdarchitects.com/wp-content/uploads/2013/09/Kiln-Apartments-1.jpg",
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
          <Buton
            size="md"
            rounded="lg"
            className="hover:bg-gray-200"
            onClick={() => openModal()}
          >
            <div className="flex gap-3 cursor-pointer">
              <IoFilter size={20} />
              <Text>Filtros</Text>
            </div>
          </Buton>
        </div>
        <div className="p-5">
          <InputField placeholder="Buscar" rounded="lg" />
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
