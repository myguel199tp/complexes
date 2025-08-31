/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useTransition } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import { Mousewheel, Pagination } from "swiper/modules";
import { Button, Text } from "complexes-next-components";
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
  email: string;
  id: string;
  phone: string;
  country: string;
  stratum: string;
  age: string;
  administration: string;
  description: string;
}

export const Cardinfo: React.FC<CardinfoProps> = ({
  images,
  price,
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

  return (
    <div className="border-2 h-[450px] w-full rounded-lg flex flex-col hover:border--2 hover:border-cyan-800">
      {/* Carousel de imágenes */}
      <div className="h-[250px] w-full">
        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          mousewheel={true}
          pagination={{ clickable: true }}
          modules={[Mousewheel, Pagination]}
          className="h-full"
        >
          {images.map((image, index) => (
            <SwiperSlide
              key={index}
              className="flex justify-center items-center h-full"
            >
              <img
                src={`${BASE_URL}/uploads/${image.replace(/^.*[\\/]/, "")}`}
                alt="imagen"
                className="rounded-lg max-h-full w-full"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Información fija */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div>
            <Text size="md" font="semi">
              {formatCurrency(Number(price))}
            </Text>

            <div className="flex">
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
                en {ofert}
              </Text>
            </div>
          </div>

          <Text size="md">
            {country},{city} ,{neighborhood}
          </Text>
          <div className="flex gap-3 my-2">
            <div className="flex items-center gap-1">
              <Text size="md">{area}</Text>
              <TbMeterSquare size={22} />
            </div>
            {["5", "7", "8"].includes(property) ? (
              <div className="flex items-center gap-1">
                <Text size="md">{room}</Text>
                <MdOutlineBedroomChild size={22} />
              </div>
            ) : null}

            {["1", "2", "6", "4", "5", "7", "8"].includes(property) ? (
              <div className="flex items-center gap-1">
                <Text size="md">{restroom}</Text>
                <GrRestroom size={22} />
              </div>
            ) : null}

            <div className="flex items-center gap-1">
              <Text size="md">{parking}</Text>
              <IoCarSport size={22} />
            </div>
          </div>
        </div>

        <div className="flex justify-center my-4">
          <Button
            size="sm"
            className="flex gap-2"
            colVariant="warning"
            rounded="md"
            onClick={handleClick}
          >
            Ver más
            {isPending && activeButton === id ? (
              <ImSpinner9 className="animate-spin text-base mr-2" />
            ) : null}
          </Button>
        </div>
      </div>
    </div>
  );
};
