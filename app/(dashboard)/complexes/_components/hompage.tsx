"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";

import "./style.css";
import { Button, Title } from "complexes-next-components";

export default function Homepage() {
  return (
    <>
      <div className="flex flex-wrap-reverse gap-3x justify-center items-center min-h-screen">
        <div className="w-[40%] text-center">
          <Title size="md" font="semi" className="text-4xl">
            Creamos productos digitales para tu conjunto y/o edificio
            residencial
          </Title>
          <h5 className="mt-4">
            Diseñamos y desarrollamos las apps siempre pensando en los
            propietarios
          </h5>
          <Button colVariant="warning">Inscribir conjunto</Button>
        </div>
        <div className="w-[60%] h-full">
          <Swiper
            spaceBetween={5}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={true}
            modules={[Pagination, Autoplay]}
            className="mySwiper"
          >
            <SwiperSlide className="rounded-lg">
              <div className="relative w-full h-[500px] rounded-lg">
                <Image
                  className="rounded-lg"
                  layout="fill"
                  objectFit="cover"
                  alt="image1"
                  src={
                    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?rs=1&pid=ImgDetMain"
                  }
                />
                <div className="absolute bottom-0 right-0 mb-4 mr-4">
                  <p className="text-white text-xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                    Hola, este es el primer carro
                  </p>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide className="rounded-lg">
              <div className="relative w-full h-[500px] rounded-lg">
                <Image
                  className="rounded-lg"
                  layout="fill"
                  objectFit="cover"
                  alt="image2"
                  src={
                    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?rs=1&pid=ImgDetMain"
                  }
                />
                <div className="absolute bottom-0 right-0 mb-4 mr-4">
                  <p className="text-white text-xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                    Hola, este es el segundo carro
                  </p>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </>
  );
}
