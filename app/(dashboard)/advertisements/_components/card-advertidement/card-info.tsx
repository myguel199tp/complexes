/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import { Mousewheel, Pagination } from "swiper/modules";
import { Text } from "complexes-next-components";

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
    <div className="border-2 h-[400px] rounded-lg">
      <Swiper
        direction={"vertical"}
        slidesPerView={1}
        spaceBetween={30}
        mousewheel={true}
        pagination={{
          clickable: true,
        }}
        modules={[Mousewheel, Pagination]}
        className="mySwiper"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full">
              <div className="relative">
                <img
                  src={`${BASE_URL}/uploads/${image.replace(/^.*[\\/]/, "")}`}
                  alt="imagen"
                  className="rounded-lg max-h-full"
                  width={400}
                  height={400}
                />
              </div>

              <div className="p-4 mt-2 rounded-lg">
                <Text>{name}</Text>
                <Text>{profession}</Text>
                <Text>{webPage}</Text>
                <Text>{phone}</Text>
                <Text>{email}</Text>
                <Text>{nameUnit}</Text>
                <Text>{description}</Text>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Cardinfo;
