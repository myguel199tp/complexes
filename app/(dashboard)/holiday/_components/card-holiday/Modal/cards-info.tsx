/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

interface CardsinfoProps {
  files?: string[];
}

const Cardsinfo: React.FC<CardsinfoProps> = ({ files = [] }) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  return (
    <div className="w-full">
      {/* Swiper principal */}
      <Swiper
        spaceBetween={5}
        navigation
        autoplay={{
          delay: 8000,
          disableOnInteraction: false,
        }}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        modules={[FreeMode, Navigation, Thumbs, Autoplay]}
        className="mainSwiper h-[70vh] rounded-lg"
      >
        {files.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="flex justify-center items-center h-96 w-96">
              <img
                src={`${BASE_URL}/uploads/${image.replace(/^.*[\\/]/, "")}`}
                alt={`imagen-${index}`}
                className="object-contain rounded-lg"
                style={{ width: "800px", maxHeight: "650px" }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Swiper miniaturas */}
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={6}
        freeMode
        watchSlidesProgress
        modules={[FreeMode, Navigation, Thumbs]}
        className="thumbsSwiper mt-4 !h-[100px]"
      >
        {files.map((image, index) => (
          <SwiperSlide key={index} className="!w-auto">
            <img
              src={`${BASE_URL}/uploads/${image.replace(/^.*[\\/]/, "")}`}
              alt={`miniatura-${index}`}
              className="rounded-md cursor-pointer object-cover h-[90px] w-[120px] border border-gray-300 hover:border-cyan-500 transition"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Cardsinfo;
