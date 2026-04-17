/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";

import "swiper/css";
import { Button, Text } from "complexes-next-components";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import ModalProducts from "./modal/modal";
import { Product } from "@/app/(panel)/my-add/services/response/addResponse";

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
  products: Product[];
  codigo: string;
  workDays: string[];
  openingHour: string;
  closingHour: string;
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
  products,
  codigo,
  workDays,
  openingHour,
  closingHour,
}) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const socialLinks = [
    {
      url: instagramred,
      icon: <FaInstagram size={18} color="#E1306C" />,
    },
    {
      url: facebookred,
      icon: <FaFacebook size={18} color="#1877F2" />,
    },
    {
      url: tiktokred,
      icon: <FaTiktok size={18} color="#000" />,
    },
    {
      url: youtubered,
      icon: <FaYoutube size={18} color="#FF0000" />,
    },
    {
      url: xred,
      icon: <FaXTwitter size={18} color="#000" />,
    },
  ];

  const [isOpenProducts, setIsOpenProducts] = useState(false);

  const isWithinSchedule = () => {
    if (!workDays?.length || !openingHour || !closingHour) return false;

    const now = new Date();

    const today = now
      .toLocaleDateString("es-ES", { weekday: "long" })
      .toLowerCase();

    const normalizedWorkDays = workDays.map((d) => d.toLowerCase());

    if (!normalizedWorkDays.includes(today)) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = openingHour.split(":").map(Number);
    const [closeH, closeM] = closingHour.split(":").map(Number);

    const openingMinutes = openH * 60 + openM;
    const closingMinutes = closeH * 60 + closeM;

    return currentMinutes >= openingMinutes && currentMinutes <= closingMinutes;
  };

  const isButtonEnabled = isWithinSchedule();

  return (
    <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-4 w-full max-w-[700px] mx-auto">
      <div className="flex gap-2 items-center">
        <Text size="md" font="bold">
          {name}
        </Text>
        <Text size="xs">{profession}</Text>
      </div>
      <div className="w-full h-[180px] rounded-lg overflow-hidden mb-2">
        {images.length > 0 && (
          <img
            src={`${BASE_URL}/uploads/${images[0].replace(/^.*[\\/]/, "")}`}
            alt="imagen"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3 mb-1">
          {socialLinks
            .filter((s) => s.url?.trim() !== "")
            .map((s, index) => (
              <Link
                key={index}
                href={s.url}
                target="_blank"
                className="hover:scale-110 transition"
              >
                {s.icon}
              </Link>
            ))}
        </div>

        <Text size="xs" className="opacity-70">
          {codigo}
        </Text>
      </div>

      <div className="space-y-1 mb-3">
        <Text size="xs">{phone}</Text>
        <Text size="xs">{email}</Text>

        {webPage && (
          <Link
            href={webPage}
            className="text-blue underline text-xs block truncate"
            target="_blank"
          >
            {webPage}
          </Link>
        )}
      </div>

      <Text size="sm" className="mb-2">
        {nameUnit}
      </Text>

      <div className="border rounded-md p-2 mb-1 bg-gray-50">
        <Text font="semi" size="xs">
          Descripción
        </Text>

        <Text size="xs" className="mt-1">
          {description}
        </Text>
      </div>

      <div className="mb-1 space-y-1">
        <Text size="xs">
          <Text as="span" font="semi" size="xs">
            Días:
          </Text>{" "}
          {(workDays ?? []).join(", ")}
        </Text>

        <Text size="xs">
          <Text as="span" font="semi" size="xs">
            Horario:
          </Text>{" "}
          {openingHour} - {closingHour}
        </Text>
      </div>

      <Button
        colVariant="success"
        size="sm"
        disabled={!isButtonEnabled}
        onClick={() => isButtonEnabled && setIsOpenProducts(true)}
        className={`w-full ${
          !isButtonEnabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Ver productos / servicios
      </Button>

      <ModalProducts
        products={products}
        isOpen={isOpenProducts}
        onClose={() => setIsOpenProducts(false)}
      />
    </div>
  );
};

export default Cardinfo;
