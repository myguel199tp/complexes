/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import { Mousewheel, Pagination } from "swiper/modules";
import { Button, Text } from "complexes-next-components";
import ModalHolliday from "./Modal/modal";

import "./style.css";

interface CardinfoProps {
  neigborhood?: string;
  city?: string;
  country?: string;
  address?: string;
  name?: string;
  price?: string;
  maxGuests?: number;
  parking?: string;
  petsAllowed?: boolean;
  ruleshome?: string;
  description: string;
  files?: string[];
  promotion?: string;
  nameUnit?: string;
  apartment?: string;
  cel?: string;
  startDate?: string | null;
  endDate?: string | null;
}

const Cardinfo: React.FC<CardinfoProps> = ({
  neigborhood,
  city,
  files,
  country,
  address,
  // name,
  price,
  maxGuests,
  // parking,
  petsAllowed,
  ruleshome,
  description,
  // apartment,
  // cel,
  startDate,
  endDate,
  promotion,
}) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const [showHolliday, setShowHolliday] = useState<boolean>(false);

  const openModal = () => {
    setShowHolliday(true);
  };
  const closeModal = () => {
    setShowHolliday(false);
  };
  return (
    <>
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
                <div className="p-4 mt-2 rounded-lg">
                  <div className="flex w-full justify-between">
                    <div className="flex justify-between">
                      <Text size="md" font="semi">
                        {formatCurrency(Number(price))}
                      </Text>
                    </div>
                    <div className="bg-green-400 flex justify-end items-end p-1 rounded-full">
                      <Text size="md" font="semi" className="text-white">
                        {promotion}
                      </Text>
                    </div>
                  </div>
                  <Text size="md">
                    {neigborhood}, {city}
                  </Text>
                  <div className="flex w-full justify-center my-4">
                    <Button
                      size="md"
                      colVariant="warning"
                      rounded="md"
                      onClick={() => openModal()}
                    >
                      Reservar
                    </Button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {showHolliday && (
        <ModalHolliday
          files={files}
          city={String(city)}
          address={String(address)}
          neigborhood={String(neigborhood)}
          petsAllowed={String(petsAllowed)}
          starteDate={String(startDate)}
          endeDate={String(endDate)}
          country={String(country)}
          description={String(description)}
          maxGuests={String(maxGuests)}
          rulesHome={String(ruleshome)}
          promotion={String(promotion)}
          pricePerDay={String(price)}
          title="Reserva"
          isOpen
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default Cardinfo;
