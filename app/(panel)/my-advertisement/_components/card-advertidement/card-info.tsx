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

  console.log(socialLinks);

  const [isOpenProducts, setIsOpenProducts] = useState(false);
  return (
    <div className="border-2 rounded-lg hover:border-cyan-800 w-full p-4">
      <div className="flex w-full gap-4">
        {/* Swiper */}
        <div>
          {images.map((image, index) => (
            <div
              key={index}
              className="w-full h-[420px] rounded-lg overflow-hidden"
            >
              <img
                src={`${BASE_URL}/uploads/${image.replace(/^.*[\\/]/, "")}`}
                alt="imagen"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="w-1/2 space-y-2">
          <div className="flex justify-between">
            <Text size="lg" font="bold">
              {name}
            </Text>
            <Text size="sm">{codigo}</Text>
          </div>
          <Text size="sm">{profession}</Text>
          <Text size="sm">{phone}</Text>
          <Text size="sm">{email}</Text>
          <Link
            href={webPage}
            className="block truncate text-blue underline"
            target="_blank"
          >
            {webPage}
          </Link>
          <div className="flex items-center gap-3 flex-wrap mt-2">
            <Text size="sm">Redes sociales:</Text>
            {socialLinks
              .filter((s) => s.url?.trim() !== "")
              .map((s, index) => (
                <Link
                  key={index}
                  href={s.url}
                  target="_blank"
                  className="hover:opacity-80"
                >
                  {s.icon}
                </Link>
              ))}
          </div>
          <Text size="sm">{nameUnit}</Text>
          <div className="h-32 overflow-y-auto border rounded-md p-2">
            <Text font="semi" size="sm">
              Descripción
            </Text>
            <Text size="sm">{description}</Text>
          </div>
          <Button
            colVariant="warning"
            onClick={() => setIsOpenProducts(true)}
            className="w-full py-2 rounded-lg font-semibold"
          >
            productos / servicios
          </Button>
          {(workDays ?? []).map((ele) => (
            <div key={ele}>{ele}</div>
          ))}
          <Text font="semi" size="sm">
            horario de atención: desde{openingHour} hasta {closingHour}
          </Text>
        </div>
      </div>

      <ModalProducts
        products={products}
        isOpen={isOpenProducts}
        onClose={() => setIsOpenProducts(false)}
      />
    </div>
  );
};

export default Cardinfo;
