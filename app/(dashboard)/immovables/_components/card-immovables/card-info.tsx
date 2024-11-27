"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import Image from "next/image";

import { Mousewheel, Pagination } from "swiper/modules";
import { Button, Text } from "complexes-next-components";
import { TbMeterSquare } from "react-icons/tb";
import { MdOutlineBedroomChild } from "react-icons/md";
import { GrRestroom } from "react-icons/gr";
import { IoCarSport } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";

interface CardinfoProps {
  images: string[];
}

const Cardinfo: React.FC<CardinfoProps> = ({ images }) => {
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
                <Image
                  className="rounded-lg"
                  width={400}
                  height={400}
                  alt={`image-${index}`}
                  src={image}
                />
                <div className="absolute top-2 right-2 p-1 rounded-full shadow-lg cursor-pointer">
                  <AiFillStar size={24} className="hover:text-yellow-300" />
                </div>
              </div>

              <div className="p-4 mt-2 rounded-lg">
                <div className="flex justify-between">
                  <Text size="md" font="semi">
                    $ 100
                  </Text>
                  <Button size="sm" colVariant="warning" rounded="lg">
                    Ver más
                  </Button>
                </div>

                <div className="flex gap-3">
                  <div className="flex justify-center items-center gap-1">
                    <Text size="md">22</Text>
                    <TbMeterSquare size={22} />
                  </div>
                  <div className="flex justify-center items-center gap-1">
                    <Text size="md">3</Text>
                    <MdOutlineBedroomChild size={22} />
                  </div>
                  <div className="flex justify-center items-center gap-1">
                    <Text size="md">2</Text>
                    <GrRestroom size={22} />
                  </div>
                  <div className="flex justify-center items-center gap-1">
                    <Text size="md">2</Text>
                    <IoCarSport size={22} />
                  </div>
                </div>
                <Text size="md">Fontibon, Bogóta</Text>
                <Text size="md" font="semi">
                  Apartamento, Arriendo
                </Text>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Cardinfo;
