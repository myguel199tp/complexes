/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
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

interface CardinfoProps {
  images: string[];
  price: string;
  area: string;
  room: string;
  restroom: string;
  parking: string;
  neighborhood: string;
  city: string;
  ofert: string;
  email: string;
  _id: string;
  phone: string;
  country: string;
  stratum: string;
  age: string;
  administration: string;
  description: string;
}

const Cardinfo: React.FC<CardinfoProps> = ({
  images,
  price,
  area,
  room,
  restroom,
  parking,
  neighborhood,
  city,
  ofert,
  email,
  _id,
  phone,
  country,
  stratum,
  age,
  administration,
  description,
}) => {
  const router = useRouter();
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return (
    <div className="border-2 h-[450px] w-full rounded-lg">
      <Swiper
        direction={"horizontal"}
        slidesPerView={1}
        spaceBetween={30}
        mousewheel={true}
        pagination={{
          clickable: true,
        }}
        modules={[Mousewheel, Pagination]}
        className="mySwiper"
        style={{ height: "450px" }}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index} style={{ height: "100%" }}>
            <div className="relative w-full h-full">
              <div className="relative w-full flex h-[250px] justify-center">
                <img
                  src={`${BASE_URL}/uploads/${image.replace(/^.*[\\/]/, "")}`}
                  className="rounded-lg"
                  width={400}
                  height={400}
                  alt="imagen"
                />
              </div>
              <div className="p-4 mt-2 rounded-lg">
                <div className="flex w-full justify-between">
                  <div className="flex justify-between">
                    <Text size="md" font="semi">
                      {formatCurrency(Number(price))}
                    </Text>
                  </div>
                  <Text size="md" font="semi">
                    {ofert}
                  </Text>
                </div>

                <div className="flex gap-3">
                  <div className="flex justify-center items-center gap-1">
                    <Text size="md">{area}</Text>
                    <TbMeterSquare size={22} />
                  </div>
                  <div className="flex justify-center items-center gap-1">
                    <Text size="md">{room}</Text>
                    <MdOutlineBedroomChild size={22} />
                  </div>
                  <div className="flex justify-center items-center gap-1">
                    <Text size="md">{restroom}</Text>
                    <GrRestroom size={22} />
                  </div>
                  <div className="flex justify-center items-center gap-1">
                    <Text size="md">{parking}</Text>
                    <IoCarSport size={22} />
                  </div>
                </div>
                <Text size="md">
                  {neighborhood}, {city}
                </Text>
                <div className="flex w-full justify-center mt-4">
                  <Button
                    size="md"
                    colVariant="warning"
                    rounded="md"
                    onClick={() => {
                      const params = new URLSearchParams({
                        price,
                        area,
                        room,
                        restroom,
                        parking,
                        neighborhood,
                        city,
                        ofert,
                        email,
                        _id,
                        phone,
                        country,
                        stratum,
                        age,
                        administration,
                        description,
                        images: JSON.stringify(images),
                      });

                      router.push(`${route.summaryInmov}?${params.toString()}`);
                    }}
                  >
                    Ver más
                  </Button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Cardinfo;
