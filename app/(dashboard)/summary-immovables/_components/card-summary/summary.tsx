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
  files?: string[];
}

const Summary: React.FC<CardinfoProps> = ({ files }) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return (
    <div>
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
        {files?.filter(Boolean).map((img, index) => {
          let src: string;

          if (typeof img === "string") {
            const filename = img.replace(/^.*[\\/]/, "");
            src = `${BASE_URL}/uploads/${filename}`;
          } else {
            src = URL.createObjectURL(img);
          }

          return (
            <SwiperSlide key={index}>
              <img
                src={src}
                className="rounded-lg"
                width={200}
                height={200}
                alt={`imagen-${index}`}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default Summary;
