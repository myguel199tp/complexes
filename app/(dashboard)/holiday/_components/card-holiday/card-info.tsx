/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import { Mousewheel, Pagination } from "swiper/modules";
import { Badge, Text } from "complexes-next-components";
import ModalHolliday from "./Modal/modal";

import "./style.css";
import { formatCurrency } from "@/app/_helpers/format-currency";
import { MdOutlinePets } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { CreateBedRoomDto } from "../../services/response/holidayResponses";
import { TbCircleDashedPercentage } from "react-icons/tb";

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
  bartroomPrivate?: boolean;
  indicative?: string;
  cleaningFee?: number;
  currency?: string;
  bedRooms: CreateBedRoomDto[];
  deposit?: number;
  roomingin?: boolean;
  residentplace?: boolean;
  status?: boolean;
  image?: string;
  anfitrion?: string;
  videoUrl: string;
  videos?: string[];
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
  endDate,
  promotion,
  codigo,
  amenities,
  name,
  bartroomPrivate,
  indicative,
  cleaningFee,
  currency,
  bedRooms,
  deposit,
  roomingin,
  residentplace,
  status,
  image,
  anfitrion,
  videoUrl,
  videos,
}) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const [showHolliday, setShowHolliday] = useState<boolean>(false);
  const swiperContainerRef = useRef<HTMLDivElement | null>(null);
  // const router = useRouter();

  // const openModal = () => {
  //   setShowHolliday(true);
  //   router.push(`/holiday/${codigo}`, { scroll: false });
  // };

  // const closeModal = () => {
  //   setShowHolliday(false);
  //   router.push("/holiday", { scroll: false });
  // };

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
      <div
        onClick={() => openModal()}
        className="border-2 cursor-pointer h-auto w-full rounded-lg flex flex-col hover:border--2 hover:border-cyan-800"
      >
        <div className="flex flex-col items-center justify-center text-center rounded-t-lg opacity-80 bg-cyan-800">
          <Text font="bold" size="sm" colVariant="on" className="mb-1">
            {country}, {city}, {neigborhood}
          </Text>
          <div className="flex gap-2">
            <Text size="sm" colVariant="on" className="leading-tight">
              {name}{" "}
              <Text as="span" size="sm" font="semi" colVariant="on">
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
            </Text>
          </div>
        </div>
        <div className="h-40 w-full">
          <Swiper
            slidesPerView={1}
            spaceBetween={30}
            mousewheel={true}
            pagination={{ clickable: true }}
            modules={[Mousewheel, Pagination]}
            className="h-10"
          >
            {files?.map((image, index) => (
              <SwiperSlide
                key={index}
                className="flex justify-center items-center"
              >
                <img
                  src={`${BASE_URL}/uploads/${image.replace(/^.*[\\/]/, "")}`}
                  alt="imagen"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="p-1 flex flex-col mt-1 justify-between">
          <Text font="bold" size="xxs">
            {codigo}
          </Text>
          <div className="flex items-center justify-between gap-4">
            {Number(promotion) > 0 ? (
              <>
                {/* Precio original tachado */}
                <Text
                  size="sm"
                  font="semi"
                  className="line-through text-gray-400"
                >
                  {formatCurrency(Number(price))}
                </Text>

                {/* Precio con descuento */}
                <Text size="sm" font="bold" className="text-green-600">
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
                  <div className="flex">
                    - {promotion}
                    <TbCircleDashedPercentage />
                  </div>
                </Badge>
              </>
            ) : (
              // Caso sin promoción
              <Text size="sm" font="semi">
                {formatCurrency(Number(price))}
              </Text>
            )}
          </div>
          <div className="flex gap-4 justify-between">
            <div className="flex items-center gap-3">
              <Text size="sm">Capacidad: {maxGuests}</Text>
              <FaPeopleGroup size={20} />
            </div>
            {petsAllowed === true ? <MdOutlinePets size={20} /> : null}
          </div>
        </div>
      </div>

      {showHolliday && (
        <ModalHolliday
          files={files}
          city={String(city)}
          videoUrl={String(videoUrl)}
          address={String(address)}
          neigborhood={String(neigborhood)}
          petsAllowed={String(petsAllowed)}
          anfitrion={String(anfitrion)}
          image={String(image)}
          // starteDate={String(startDate)}
          roomingin={Boolean(roomingin)}
          residentplace={Boolean(residentplace)}
          status={Boolean(status)}
          deposit={String(deposit)}
          bedRooms={bedRooms}
          parking={Boolean(parking)}
          endeDate={String(endDate)}
          country={String(country)}
          currency={String(currency)}
          description={String(description)}
          maxGuests={String(maxGuests)}
          rulesHome={String(ruleshome)}
          promotion={String(promotion)}
          pricePerDay={String(price)}
          amenities={amenities}
          name={String(name)}
          bartroomPrivate={Boolean(bartroomPrivate)}
          indicative={String(indicative)}
          cleaningFee={Number(cleaningFee)}
          videos={videos}
          codigo={codigo}
          title="Reserva"
          isOpen
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default Cardinfo;
