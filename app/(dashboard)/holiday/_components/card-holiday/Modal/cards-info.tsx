/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-cards";

import { EffectCards } from "swiper/modules";

interface CardsinfoProps {
  files?: string[];
}

const Cardsinfo: React.FC<CardsinfoProps> = ({ files }: CardsinfoProps) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return (
    <>
      <div className="border-2 h-full w-full rounded-lg">
        <Swiper
          effect={"cards"}
          grabCursor={true}
          modules={[EffectCards]}
          className="mySwiper"
        >
          {files?.map((image, index) => (
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
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
};

export default Cardsinfo;
