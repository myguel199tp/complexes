/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import { Mousewheel, Pagination } from "swiper/modules";
import { Button, Text } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";

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
  country,
  price,
  parking,
  description,
  files,
  promotion,
}) => {
  const router = useRouter();
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return (
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
        {files.map((image, index) => (
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
                  <Text size="md" font="semi">
                    {promotion}
                  </Text>
                </div>
                <Text size="md">
                  {neigborhood}, {city}
                </Text>
                <div className="flex w-full justify-center mt-4">
                  <Button
                    size="md"
                    colVariant="warning"
                    rounded="md"
                    onClick={() => {
                      const paramsObj = {
                        price,
                        parking,
                        neigborhood,
                        city,
                        country,
                        description,
                        files: JSON.stringify(files),
                      };

                      // Elimina las claves cuyo valor sea undefined y fuerza el tipo
                      const filteredParams = Object.fromEntries(
                        Object.entries(paramsObj).filter(
                          ([_, v]): v is string => typeof v === "string"
                        )
                      ) as Record<string, string>;

                      const params = new URLSearchParams(filteredParams);

                      router.push(`${route.summaryInmov}?${params.toString()}`);
                    }}
                  >
                    Ver más
                  </Button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Cardinfo;
