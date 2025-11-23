/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import { Mousewheel, Pagination } from "swiper/modules";
import { Button, Text } from "complexes-next-components";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import ModalProducts from "./modal/modal";

interface CardinfoProps {
  images: string[];
  nameUnit: string;
  profession: string;
  webPage: string;
  name: string;
  email: string;
  description: string;
  phone: string;
  instagramred: string;
  facebookred: string;
  tiktokred: string;
  youtubered: string;
  xred: string;
}

const Cardinfo: React.FC<CardinfoProps> = ({
  images,
  name,
  profession,
  webPage,
  phone,
  email,
  nameUnit,
  description,
  instagramred,
  facebookred,
  tiktokred,
  youtubered,
  xred,
}) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const socialLinks = [
    {
      url: instagramred,
      icon: <FaInstagram size={20} color="#E1306C" />,
      label: "Instagram",
    },
    {
      url: facebookred,
      icon: <FaFacebook size={20} color="#1877F2" />,
      label: "Facebook",
    },
    {
      url: tiktokred,
      icon: <FaTiktok size={20} color="#000000" />,
      label: "TikTok",
    },
    {
      url: youtubered,
      icon: <FaYoutube size={20} color="#FF0000" />,
      label: "YouTube",
    },
    {
      url: xred,
      icon: <FaXTwitter size={20} color="#000000" />,
      label: "X",
    },
  ];

  const [isOpenProducts, setIsOpenProducts] = useState(false);

  return (
    <div className="border-2 h-96 rounded-lg hover:border-cyan-800 w-full p-4">
      <div className="flex w-full h-[520px] gap-4">
        {/* Swiper */}
        <div className="w-1/2 h-full">
          <Swiper
            direction={"vertical"}
            slidesPerView={1}
            spaceBetween={30}
            mousewheel
            pagination={{ clickable: true }}
            modules={[Mousewheel, Pagination]}
            className="h-full"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="w-full h-[320px] overflow-hidden rounded-lg">
                  <img
                    src={`${BASE_URL}/uploads/${image.replace(/^.*[\\/]/, "")}`}
                    alt="imagen"
                    className="w-full h-full object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Informacion */}
        <div className="w-1/2 h-full overflow-y-auto pr-2">
          <Text size="lg" font="bold">
            {name}
          </Text>
          <Text size="sm">{profession}</Text>
          <Text size="sm">{phone}</Text>
          <Text size="sm">{email}</Text>

          <Link
            href={webPage}
            className="block max-w-full truncate text-blue underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {webPage}
          </Link>
          <div className="flex flex-wrap gap-3 mt-2">
            <Text size="sm">Redes sociales</Text>
            {socialLinks
              .filter((s) => s.url && s.url.trim() !== "")
              .map((s, index) => (
                <Link
                  key={index}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline"
                >
                  {s.icon}
                </Link>
              ))}
          </div>

          <Text size="sm">{nameUnit}</Text>

          <div className="mt-2 h-36 overflow-y-auto border-2 rounded-md border-gray-600 p-2">
            <Text font="semi" size="sm">
              Descripción
            </Text>
            <Text size="sm">{description}</Text>
          </div>

          {/* BOTÓN VER PRODUCTOS */}
          <Button
            colVariant="warning"
            onClick={() => setIsOpenProducts(true)}
            className="text-center block my-2 py-2 px-4 rounded-lg font-semibold w-full"
          >
            productos / servicios
          </Button>
        </div>
      </div>
      <ModalProducts
        isOpen={isOpenProducts}
        onClose={() => setIsOpenProducts(false)}
      />
    </div>
  );
};

export default Cardinfo;
