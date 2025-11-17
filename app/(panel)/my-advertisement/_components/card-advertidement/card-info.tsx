/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import { Mousewheel, Pagination } from "swiper/modules";
import { Text } from "complexes-next-components";
import Link from "next/link";

interface CardinfoProps {
  images: string[];
  nameUnit: string;
  profession: string;
  webPage: string;
  name: string;
  email: string;
  description: string;
  phone: string;
}

const Cardinfo: React.FC<CardinfoProps> = ({
  images,
  name,
  profession,
  webPage,
  phone,
  email,
  nameUnit,
  description,
}) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return (
    <div className="border-2 h-[520px] rounded-lg hover:border-cyan-800">
      <div className="relative w-full h-52">
        <Swiper
          direction={"vertical"}
          slidesPerView={1}
          spaceBetween={30}
          mousewheel={true}
          pagination={{
            clickable: true,
          }}
          modules={[Mousewheel, Pagination]}
          className="h-full"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="w-full h-full flex justify-center items-center">
                <img
                  src={`${BASE_URL}/uploads/${image.replace(/^.*[\\/]/, "")}`}
                  alt="imagen"
                  className="w-full h-60 object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Contenido fijo debajo del Swiper */}
      <div className="p-4 mt-2 rounded-lg">
        <Text size="sm">Nombre del negocio: {name}</Text>
        <Text size="sm">{profession}</Text>
        <Text size="sm">{phone}</Text>
        <Text size="sm">{email}</Text>
        <Link
          href={webPage}
          className="block max-w-full truncate text-blue underline"
          target="_blank" // opcional, para abrir en nueva pestaña
          rel="noopener noreferrer"
        >
          Página web: {webPage}
        </Link>
        <Text size="sm">{nameUnit}</Text>
        <div className="mt-1 h-36 overflow-y-auto border-2 rounded-md border-gray-600 p-4">
          <Text font="semi" size="sm">
            Descripción
          </Text>
          <Text size="sm">{description}</Text>
        </div>
      </div>
    </div>
  );
};

export default Cardinfo;
