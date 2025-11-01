/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useTransition } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Mousewheel, Pagination } from "swiper/modules";
import { Text } from "complexes-next-components";
import { TbMeterSquare } from "react-icons/tb";
import { MdOutlineBedroomChild } from "react-icons/md";
import { GrRestroom } from "react-icons/gr";
import { IoCarSport } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { ImSpinner9 } from "react-icons/im";

interface CardinfoProps {
  images: string[];
  price: string;
  area: string;
  room: string;
  restroom: string;
  property: string;
  parking: string;
  neighborhood: string;
  city: string;
  ofert: string;
  email?: string;
  id: string;
  phone?: string;
  country: string;
  stratum?: string;
  age?: string;
  administration?: string;
  description?: string;
  videos?: string[];
  videosUrl?: string;
  amenities?: string[];
  amenitiesResident?: string[];
  codigo?: string;
}

export const Cardinfo: React.FC<CardinfoProps> = ({
  images,
  price,
  codigo,
  description,
  area,
  room,
  restroom,
  property,
  parking,
  neighborhood,
  country,
  city,
  ofert,
  id,
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const handleClick = () => {
    setActiveButton(id);
    startTransition(() => {
      const params = new URLSearchParams({ id });
      router.push(`${route.summaryInmov}?${params.toString()}`);
    });
  };

  // fallback image por si images está vacío
  const firstImage =
    images && images.length > 0
      ? `${BASE_URL}/uploads/${images[0].replace(/^.*[\\/]/, "")}`
      : "/placeholder-image.png";

  return (
    <div
      onClick={handleClick}
      className={`relative border-2 h-[500px] w-full rounded-lg flex flex-col bg-white shadow-sm cursor-pointer transition
        ${
          activeButton === id
            ? "border-cyan-800 opacity-70"
            : "hover:border-cyan-800"
        }`}
    >
      {/* Overlay de carga */}
      {isPending && activeButton === id && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
          <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
        </div>
      )}

      {/* Carousel de imágenes */}
      <div className="h-[250px] w-full overflow-hidden">
        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          mousewheel={true}
          pagination={{ clickable: true }}
          modules={[Mousewheel, Pagination]}
          className="h-full"
        >
          {images && images.length > 0 ? (
            images.map((image, index) => (
              <SwiperSlide
                key={index}
                className="flex justify-center items-center h-full"
              >
                <img
                  src={`${BASE_URL}/uploads/${image.replace(/^.*[\\/]/, "")}`}
                  alt={`imagen-${index}`}
                  className="rounded-t-lg  w-full h-full"
                />
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide className="flex justify-center items-center h-full">
              <img
                src={firstImage}
                alt="imagen-fallback"
                className="rounded-t-lg w-full h-full"
              />
            </SwiperSlide>
          )}
        </Swiper>
      </div>

      {/* Información fija */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <div>
            <div className="flex justify-between w-full">
              <Text size="md" font="semi">
                {formatCurrency(Number(price))}
              </Text>
              <Text size="sm" font="semi">
                {codigo}
              </Text>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Text size="sm" font="semi">
                {property === "5" ? "Apartamento" : ""}
                {property === "7" ? "Casa" : ""}
                {property === "6" ? "Local" : ""}
                {property === "4" ? "Oficina" : ""}
                {property === "1" ? "Bodega" : ""}
                {property === "3" ? "Lote" : ""}
                {property === "2" ? "Dormitorio" : ""}
                {property === "8" ? "Apartaestudio" : ""}
              </Text>
              <Text size="sm" font="semi" className="ml-1">
                {ofert ? `en ${ofert}` : ""}
              </Text>
            </div>
          </div>

          <Text size="sm" className="mt-2">
            {country}, {city}, {neighborhood}
          </Text>

          <div className="flex gap-3 my-3 flex-wrap">
            <div className="flex items-center gap-1">
              <Text size="sm" font="semi">
                {area}
              </Text>
              <TbMeterSquare size={20} />
            </div>
            {["5", "7", "8"].includes(property) && (
              <div className="flex items-center gap-1">
                <Text size="sm" font="semi">
                  {room}
                </Text>
                <MdOutlineBedroomChild size={20} />
              </div>
            )}

            {["1", "2", "6", "4", "5", "7", "8"].includes(property) && (
              <div className="flex items-center gap-1">
                <Text size="sm" font="semi">
                  {restroom}
                </Text>
                <GrRestroom size={20} />
              </div>
            )}

            <div className="flex items-center gap-1">
              <Text size="md">{parking}</Text>
              <IoCarSport size={20} />
            </div>
          </div>
          <div>
            <Text size="xs" font="semi">
              {" "}
              Descripción
            </Text>
            <Text size="xs">{description}</Text>
          </div>
        </div>
      </div>
    </div>
  );
};
