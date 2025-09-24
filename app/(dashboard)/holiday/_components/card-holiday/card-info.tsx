/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import { Mousewheel, Pagination } from "swiper/modules";
import { Badge, Buton, Text } from "complexes-next-components";
import ModalHolliday from "./Modal/modal";

import "./style.css";
import { formatCurrency } from "@/app/_helpers/format-currency";
import { MdOutlinePets } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";

interface CardinfoProps {
  neigborhood?: string;
  city?: string;
  country?: string;
  address?: string;
  name?: string;
  price?: number;
  property?: string;
  maxGuests?: number;
  parking?: boolean;
  petsAllowed?: boolean;
  ruleshome?: string;
  description: string;
  files?: string[];
  promotion?: string;
  nameUnit?: string;
  apartment?: string;
  cel?: string;
  startDate?: string | null;
  endDate?: string | null;
  codigo: string;
  amenities: string[];
}

const Cardinfo: React.FC<CardinfoProps> = ({
  neigborhood,
  city,
  files,
  country,
  address,
  price,
  property,
  maxGuests,
  parking,
  petsAllowed,
  ruleshome,
  description,
  startDate,
  endDate,
  promotion,
  codigo,
  amenities,
  name,
}) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const [showHolliday, setShowHolliday] = useState<boolean>(false);
  const swiperContainerRef = useRef<HTMLDivElement | null>(null);

  const openModal = () => {
    setShowHolliday(true);
  };

  const closeModal = () => {
    setShowHolliday(false);
  };

  useEffect(() => {
    const el = swiperContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation(); // Evita que el scroll salga del Swiper
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <>
      <div className="border-2 h-[620px] w-full rounded-lg flex flex-col hover:border--2 hover:border-cyan-800">
        <div className="h-[300px] w-full">
          <div className="bg-cyan-800 relative p-4 rounded">
            {/* Código en la esquina superior derecha */}
            <Text size="sm" colVariant="on" className="absolute top-2 right-2">
              {codigo}
            </Text>

            {/* Contenido centrado (ubicación arriba, name debajo) */}
            <div className="flex flex-col items-center justify-center text-center">
              <Text font="bold" size="md" colVariant="on" className="mb-1">
                {country}, {city}, {neigborhood}
              </Text>

              <Text size="sm" colVariant="on" className="leading-tight">
                {name}
              </Text>
            </div>
          </div>
          <Swiper
            slidesPerView={1}
            spaceBetween={30}
            mousewheel={true}
            pagination={{ clickable: true }}
            modules={[Mousewheel, Pagination]}
            className="h-full"
          >
            {files?.map((image, index) => (
              <SwiperSlide
                key={index}
                className="flex justify-center items-center h-full"
              >
                <img
                  src={`${BASE_URL}/uploads/${image.replace(/^.*[\\/]/, "")}`}
                  alt="imagen"
                  className="rounded-lg max-h-full"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="p-4  flex flex-col mt-10 justify-between 0">
          <div className="flex justify-between  mt-4">
            <Text size="md" font="semi" className="mt-4">
              {property === "1" ? "Apartamento" : ""}
              {property === "2" ? "Penthhouse" : ""}
              {property === "3" ? "Loft" : ""}
              {property === "4" ? "Estudio" : ""}
              {property === "5" ? "Duplex" : ""}
              {property === "6" ? "Casa" : ""}
              {property === "7" ? "Casa de campo" : ""}
              {property === "8" ? "Casa pequeña" : ""}

              {property === "9" ? "Casa rural" : ""}
              {property === "10" ? "Casa en arbol" : ""}
              {property === "11" ? "Casa rodante" : ""}
              {property === "12" ? "Casa cueva" : ""}
              {property === "13" ? "Chalet" : ""}
              {property === "14" ? "Villa" : ""}
              {property === "15" ? "Riads" : ""}
              {property === "16" ? "Finca" : ""}

              {property === "17" ? "Eco-granja" : ""}
              {property === "18" ? "Hacienda" : ""}
              {property === "19" ? "Glamping" : ""}
              {property === "20" ? "Bungalow" : ""}
              {property === "21" ? "Tipis" : ""}
              {property === "22" ? "Yutras" : ""}
              {property === "23" ? "Eco-lodges" : ""}
              {property === "24" ? "Habitación" : ""}
              {property === "25" ? "Posada" : ""}
            </Text>
          </div>

          <div className="flex w-full 0 justify-between">
            <div className="flex items-center gap-4">
              {Number(promotion) > 0 ? (
                <>
                  {/* Precio original tachado */}
                  <Text
                    size="md"
                    font="semi"
                    className="line-through text-gray-400"
                  >
                    {formatCurrency(Number(price))}
                  </Text>

                  {/* Precio con descuento */}
                  <Text size="md" font="bold" className="text-green-600">
                    {formatCurrency(
                      Number(price) - (Number(price) * Number(promotion)) / 100
                    )}
                  </Text>

                  {/* Badge de promoción */}
                  <Badge
                    size="sm"
                    colVariant="success"
                    background="success"
                    rounded="lg"
                    font="bold"
                  >
                    Promoción {promotion} %
                  </Badge>
                </>
              ) : (
                // Caso sin promoción
                <Text size="md" font="semi">
                  {formatCurrency(Number(price))}
                </Text>
              )}
            </div>
          </div>
          <div className="flex gap-4 justify-between">
            <div className="flex items-center gap-3">
              <Text>Capacidad: {maxGuests}</Text>
              <FaPeopleGroup size={30} />
            </div>
            {petsAllowed === true ? <MdOutlinePets size={30} /> : null}
          </div>
          <div>
            <Text>{description}</Text>
          </div>
        </div>
        <div className="flex justify-center items-center p-4">
          <Buton
            size="full"
            colVariant="warning"
            rounded="md"
            onClick={() => openModal()}
          >
            Reservar
          </Buton>
        </div>
      </div>

      {showHolliday && (
        <ModalHolliday
          files={files}
          city={String(city)}
          address={String(address)}
          neigborhood={String(neigborhood)}
          petsAllowed={String(petsAllowed)}
          starteDate={String(startDate)}
          parking={String(parking)}
          endeDate={String(endDate)}
          country={String(country)}
          description={String(description)}
          maxGuests={String(maxGuests)}
          rulesHome={String(ruleshome)}
          promotion={String(promotion)}
          pricePerDay={String(price)}
          amenities={amenities}
          name={String(name)}
          title="Reserva"
          isOpen
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default Cardinfo;
