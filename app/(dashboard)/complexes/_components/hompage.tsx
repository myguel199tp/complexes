"use client";
import React, { useTransition } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";

import "./style.css";
import { Button, Text, Title } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { ImSpinner9 } from "react-icons/im";

export default function Homepage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      router.push(route.registerComplex);
    });
  };
  return (
    <div className="flex flex-col md:!flex-row gap-3 justify-center items-center min-h-screen ">
      <div className="w-[40%] text- justify-center">
        <Title size="md" font="bold" className="text-4xl">
          TU CONJUNTO, MÁS CONECTADO QUE NUNCA
        </Title>
        <Text as="h5" className="mt-1">
          Una app hecha para propietarios, con propietarios en mente
        </Text>

        <Button
          className="flex gap-2 mt-2"
          colVariant="warning"
          rounded="md"
          onClick={handleClick}
        >
          Inscribir conjunto
          {isPending ? (
            <ImSpinner9 className="animate-spin text-base mr-2" />
          ) : null}
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
                fill
                style={{ objectFit: "cover" }}
                alt="image1"
                src={"/apartamento.jpeg"}
              />
              <div className="absolute bottom-0 right-0 mb-4 mr-4 bg-opacity-50 px-4 py-2 rounded-lg">
                <Text
                  size="lg"
                  font="bold"
                  className="text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg "
                >
                  El hogar es un lugar donde buscar descansar y tener paz
                </Text>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide className="rounded-lg">
            <div className="relative w-full h-[500px] rounded-lg">
              <Image
                className="rounded-lg"
                fill
                style={{ objectFit: "cover" }}
                alt="image2"
                src={"/family.jpg"}
              />
              <div className="absolute bottom-0 right-0 mb-4 mr-4">
                <Text
                  size="lg"
                  font="bold"
                  className="text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg "
                >
                  Un hogar es el lugar donde tu familia construye una nueva y
                  gran historia
                </Text>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide className="rounded-lg">
            <div className="relative w-full h-[500px] rounded-lg">
              <Image
                className="rounded-lg"
                fill
                style={{ objectFit: "cover" }}
                alt="image2"
                src={"/montaña.jpeg"}
              />
              <div className="absolute bottom-0 right-0 mb-4 mr-4">
                <Text
                  size="lg"
                  font="bold"
                  className="text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg "
                >
                  Una hermosa vista a la montaña y campo a tu alrrededor
                  enuentra tu lugar perfecto
                </Text>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide className="rounded-lg">
            <div className="relative w-full h-[500px] rounded-lg">
              <Image
                className="rounded-lg"
                fill
                style={{ objectFit: "cover" }}
                alt="image2"
                src={"/playa.jpeg"}
              />
              <div className="absolute bottom-0 right-0 mb-4 mr-4">
                <Text
                  size="lg"
                  font="bold"
                  className="text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg "
                >
                  Encuentra una casa o apartamento cerca al mar donde puedas
                  disfrutar de un hermoso amanecer
                </Text>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}
