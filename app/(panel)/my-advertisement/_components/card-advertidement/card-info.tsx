/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";

import "swiper/css";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiPhone, FiMail, FiGlobe, FiClock } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { MdStorefront } from "react-icons/md";
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

const DAY_LABELS: Record<string, string> = {
  lunes: "Lun",
  martes: "Mar",
  miercoles: "Mié",
  jueves: "Jue",
  viernes: "Vie",
  sabado: "Sáb",
  domingo: "Dom",
};

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
    { url: instagramred, icon: <FaInstagram size={15} />, color: "text-pink-500", bg: "hover:bg-pink-50" },
    { url: facebookred, icon: <FaFacebook size={15} />, color: "text-blue-600", bg: "hover:bg-blue-50" },
    { url: tiktokred, icon: <FaTiktok size={15} />, color: "text-gray-900", bg: "hover:bg-gray-100" },
    { url: youtubered, icon: <FaYoutube size={15} />, color: "text-red-600", bg: "hover:bg-red-50" },
    { url: xred, icon: <FaXTwitter size={15} />, color: "text-gray-800", bg: "hover:bg-gray-100" },
  ];

  const [isOpenProducts, setIsOpenProducts] = useState(false);

  const isWithinSchedule = () => {
    if (!workDays?.length || !openingHour || !closingHour) return false;
    const now = new Date();
    const today = now.toLocaleDateString("es-ES", { weekday: "long" }).toLowerCase();
    const normalizedWorkDays = workDays.map((d) => d.toLowerCase());
    if (!normalizedWorkDays.includes(today)) return false;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = openingHour.split(":").map(Number);
    const [closeH, closeM] = closingHour.split(":").map(Number);
    return currentMinutes >= openH * 60 + openM && currentMinutes <= closeH * 60 + closeM;
  };

  const isButtonEnabled = isWithinSchedule();
  const activeSocials = socialLinks.filter((s) => s.url?.trim() !== "" && s.url !== "null" && s.url !== "undefined");

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-gray-100 flex flex-col">

      {/* ── Image hero ── */}
      <div className="relative w-full h-[210px] overflow-hidden flex-shrink-0">
        {images.length > 0 ? (
          <img
            src={`${BASE_URL}/uploads/${images[0].replace(/^.*[\\/]/, "")}`}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-700 flex items-center justify-center">
            <MdStorefront size={56} className="text-white/30" />
          </div>
        )}

        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* open/closed badge */}
        <div
          className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border ${
            isButtonEnabled
              ? "bg-green-500/25 text-green-200 border-green-400/40"
              : "bg-black/30 text-gray-300 border-white/20"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isButtonEnabled ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
          {isButtonEnabled ? "Abierto" : "Cerrado"}
        </div>

        {/* codigo badge */}
        {codigo && (
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white/70 text-[10px] px-2 py-1 rounded-full font-mono">
            #{codigo}
          </div>
        )}

        {/* name + profession overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg line-clamp-1">
            {name}
          </h3>
          {profession && (
            <span className="inline-flex items-center gap-1 mt-1.5 bg-white/15 backdrop-blur-sm text-white/90 text-xs px-2.5 py-0.5 rounded-full border border-white/25">
              <HiSparkles size={10} className="text-cyan-300" />
              {profession}
            </span>
          )}
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* unit + description */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-3 border border-cyan-100/70">
          <p className="text-xs font-semibold text-cyan-800 mb-1 uppercase tracking-wide">{nameUnit}</p>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{description}</p>
        </div>

        {/* contact info */}
        <div className="space-y-1.5">
          {phone && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FiPhone size={12} className="text-cyan-500 shrink-0" />
              <span>{phone}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FiMail size={12} className="text-cyan-500 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          )}
          {webPage && webPage !== "null" && (
            <Link
              href={webPage}
              target="_blank"
              className="flex items-center gap-2 text-xs text-blue-500 hover:text-blue-700 transition-colors"
            >
              <FiGlobe size={12} className="shrink-0" />
              <span className="truncate">{webPage}</span>
            </Link>
          )}
        </div>

        {/* schedule */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FiClock size={12} className="text-orange-400 shrink-0" />
            <span className="font-medium text-gray-700">{openingHour} – {closingHour}</span>
          </div>
          {workDays?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {workDays.map((day) => (
                <span
                  key={day}
                  className="text-[10px] font-medium bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200 capitalize"
                >
                  {DAY_LABELS[day.toLowerCase()] ?? day}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* social links */}
        {activeSocials.length > 0 && (
          <div className="flex items-center gap-2">
            {activeSocials.map((s, i) => (
              <Link
                key={i}
                href={s.url}
                target="_blank"
                className={`w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center ${s.color} ${s.bg} hover:scale-110 transition-all duration-200 shadow-sm`}
              >
                {s.icon}
              </Link>
            ))}
          </div>
        )}

        {/* spacer so button stays at bottom */}
        <div className="flex-1" />

        {/* CTA */}
        <button
          disabled={!isButtonEnabled}
          onClick={() => isButtonEnabled && setIsOpenProducts(true)}
          className={`w-full py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 mt-1 ${
            isButtonEnabled
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-200/60 hover:shadow-cyan-300/70 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isButtonEnabled ? "Ver productos / servicios" : "Fuera de horario"}
        </button>
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
