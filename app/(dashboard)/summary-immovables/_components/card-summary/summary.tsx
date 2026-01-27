/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

import "./styles.css";

import { EffectCoverflow, Pagination } from "swiper/modules";

interface CardinfoProps {
  images: string[];
}

const Summary: React.FC<CardinfoProps> = ({ images }) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return (
    <div className=" md:w-[95%] p-2">
      <Swiper
        effect="coverflow"
        grabCursor
        centeredSlides
        slidesPerView="auto"
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        pagination
        modules={[EffectCoverflow, Pagination]}
        className="mySwiper"
      >
        {images?.map((image, index) => {
          const filename = image.replace(/^.*[\\/]/, "");
          const src = `${BASE_URL}/uploads/${filename}`;

          return (
            <SwiperSlide key={index}>
              <img
                src={src}
                alt={`imagen-${index}`}
                className="rounded-lg object-cover w-full h-full mx-auto"
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default Summary;
