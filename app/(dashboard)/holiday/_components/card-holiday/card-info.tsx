/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import { Mousewheel, Pagination } from "swiper/modules";
import { Button, Text } from "complexes-next-components";
import ModalHolliday from "./Modal/modal";

import "./style.css";
import { formatCurrency } from "@/app/_helpers/format-currency";

interface CardinfoProps {
  neigborhood?: string;
  city?: string;
  country?: string;
  address?: string;
  name?: string;
  price?: string;
  property?: string;
  maxGuests?: number;
  parking?: string;
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
      <div className="border-2 h-[500px] w-full rounded-lg flex flex-col hover:border--2 hover:border-cyan-800">
        <div className="h-[250px] w-full">
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
                  width={400}
                  height={400}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="p-4  flex flex-col justify-between 0">
          <div className="flex w-full 0 justify-between">
            <div className="flex">
              <Text size="md" font="semi">
                {formatCurrency(Number(price))}
              </Text>
            </div>
            <div className="flex">
              <Button
                size="md"
                colVariant="warning"
                rounded="md"
                onClick={() => openModal()}
              >
                Reservar
              </Button>
            </div>
          </div>
          <div className="flex justify-between  mt-1">
            <Text size="md" font="semi">
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
            <div className="bg-green-400 flex justify-end items-end p-1 rounded-full">
              <Text size="md" font="semi" className="text-white">
                {promotion} %
              </Text>
            </div>
          </div>

          <Text size="md">
            {neigborhood}, {city}
          </Text>
          <Text>{description}</Text>
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
          title="Reserva"
          isOpen
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default Cardinfo;
