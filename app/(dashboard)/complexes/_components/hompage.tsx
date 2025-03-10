"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";

import "./style.css";
import { Button, Text, Title } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";

export default function Homepage() {
  const router = useRouter();
  return (
    <div className="flex flex-col md:!flex-row gap-3x justify-center items-center min-h-screen ">
      <div className="w-[40%] text-center">
        <Title size="md" font="semi" className="text-4xl">
          Creamos productos digitales para tu conjunto y/o edificio residencial
        </Title>
        <h5 className="mt-4">
          Diseñamos y desarrollamos las apps siempre pensando en los
          propietarios
        </h5>
        <Button
          colVariant="warning"
          onClick={() => {
            router.push(route.registerComplex);
          }}
        >
          Inscribir conjunto
        </Button>
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
                src={"/apartamento.jpeg"}
              />
              <div className="absolute bottom-0 right-0 mb-4 mr-4 bg-opacity-50 px-4 py-2 rounded-lg">
                <Text className="text-white text-xl font-bold bg-black ">
                  El apartamento es un lugar donde buscar descansar y tener paz
                </Text>
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
                src={"/family.jpg"}
              />
              <div className="absolute bottom-0 right-0 mb-4 mr-4">
                <p className="text-white text-xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                  Un hogar es el lugar donde tu familia construye una nueva y
                  gran historia
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
                src={"/montaña.jpeg"}
              />
              <div className="absolute bottom-0 right-0 mb-4 mr-4">
                <p className="text-white text-xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                  Una hermosa vista a la mintaña y campo a tu alrrededor
                  enuentra tu lugar perfecto
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
                src={"/playa.jpeg"}
              />
              <div className="absolute bottom-0 right-0 mb-4 mr-4">
                <p className="text-white text-xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                  Encuentra una casa o apartamento cerca al mar donde puedas
                  disfrutar de un hermoso amanecer
                </p>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}
