/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Modal, Avatar } from "complexes-next-components";
import React, { useState, useMemo, useEffect } from "react";
import Cardsinfo from "./cards-info";
import Map from "./map";
import { FaImage, FaMapMarkedAlt, FaCalendarAlt } from "react-icons/fa";
import RegisterOptions from "@/app/(panel)/my-holliday/_components/holliday/_components/register-options";
import { DateRange } from "react-date-range";

type DateRangeItem = {
  startDate?: Date;
  endDate?: Date;
  key?: string;
};

type RangeKeyDictLocal = {
  [key: string]: DateRangeItem;
};

import { es } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { IoHeartCircleSharp, IoClose } from "react-icons/io5";
import { CreateBedRoomDto } from "../../../services/response/holidayResponses";
import Form from "./form";
import { useMutationFavorites } from "./favorites-mutation";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useBookingPreview } from "./useBookingPreviewMutation";
import { useBlockedDates } from "./useBlockedDates";
import { ImSpinner9 } from "react-icons/im";
import { MdOutlineBedroomParent, MdOutlinePets } from "react-icons/md";
import { GiBunkBeds } from "react-icons/gi";
import { FaCarTunnel, FaPeopleRoof } from "react-icons/fa6";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  title: string;
  property: string;
  pricePerDay: string;
  promotion?: string;
  country: string;
  city: string;
  neigborhood: string;
  address: string;
  description: string;
  rulesHome: string;
  endeDate: string;
  petsAllowed: string;
  maxGuests: string;
  parking: boolean;
  files?: string[];
  amenities: string[];
  name: string;
  codigo: string;
  bartroomPrivate: boolean;
  indicative: string;
  cleaningFee: number;
  currency: string;
  deposit: string;
  status: boolean;
  roomingin: boolean;
  residentplace: boolean;
  bedRooms: CreateBedRoomDto[];
  anfitrion: string;
  image: string;
  videoUrl: string;
  videos?: string[];
}

export default function ModalHolliday(props: Props) {
  const {
    isOpen,
    onClose,
    id,
    title,
    pricePerDay,
    property,
    promotion,
    country,
    city,
    neigborhood,
    address,
    description,
    rulesHome,
    endeDate,
    petsAllowed,
    files,
    maxGuests,
    parking,
    amenities,
    name,
    codigo,
    cleaningFee,
    currency,
    deposit,
    bedRooms,
    anfitrion,
    image,
    videoUrl,
    videos,
  } = props;

  const [dateRange, setDateRange] = useState<DateRangeItem[]>([
    { startDate: undefined, endDate: undefined, key: "selection" },
  ]);
  const showAlert = useAlertStore((state) => state.showAlert);
  const [isMobile, setIsMobile] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const router = useRouter();
  const storedUserId = useConjuntoStore((state) => state.userId);
  const [getPay, setGetPay] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const { amenitiesOptions } = RegisterOptions();
  const startDate = dateRange[0].startDate;
  const endDate = dateRange[0].endDate;

  const totalDays = useMemo(() => {
    if (startDate && endDate) {
      const diff = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return diff > 0 ? diff : 0;
    }
    return 0;
  }, [startDate, endDate]);

  const { disabledDates } = useBlockedDates(id);

  const hasBlockedInRange = (start: Date, end: Date) =>
    disabledDates.some((d) => d >= start && d <= end);

  const {
    mutate: previewBooking,
    data: previewData,
    isPending,
  } = useBookingPreview();

  const subtotal = previewData?.subtotal ?? 0;
  const discount = previewData?.discount ?? 0;
  const taxes = previewData?.taxes ?? 0;
  const totalFinal = previewData?.total ?? 0;

  useEffect(() => {
    if (!startDate || !endDate) return;
    if (startDate.getTime() === endDate.getTime()) return;
    const diffDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 2 || diffDays > 25) {
      showAlert("La estancia debe ser entre 2 y 25 días", "info");
      return;
    }
    previewBooking({
      holidayId: id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    setShowCalendar(false);
  }, [startDate, endDate, id, previewBooking]);

  const formatCurrency = (value: number) => {
    const currencyCode = currency || "COP";
    let locale = "es-CO";
    if (currencyCode === "USD") locale = "en-US";
    else if (currencyCode === "EUR") locale = "de-DE";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 0,
      }).format(value || 0);
    } catch {
      return value.toFixed(0);
    }
  };

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const imageName = image
    ? `${BASE_URL}/uploads/${image.replace(/^.*[\\/]/, "")}`
    : "";
  const videoName =
    videos && videos.length > 0
      ? `${BASE_URL}/uploads/${videos[0].replace(/^.*[\\/]/, "")}`
      : "";

  useEffect(() => {
    const params = new URLSearchParams({
      street: address,
      suburb: neigborhood,
      city,
      country,
      format: "json",
      limit: "1",
      countrycodes: "co",
    });
    const fetchCoords = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        );
        const data: { lat: string; lon: string }[] = await res.json();
        if (data?.length > 0)
          setCoords({ lat: +data[0].lat, lng: +data[0].lon });
      } catch {
        /* ignore */
      }
    };
    fetchCoords();
  }, [address, neigborhood, city, country]);

  const formatDate = (date?: Date) =>
    date
      ? date.toLocaleDateString("es-CO", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";

  const { mutate } = useMutationFavorites();
  const { language } = useLanguage();

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const discountedPrice =
    Number(pricePerDay) - (Number(pricePerDay) * Number(promotion ?? 0)) / 100;

  const stats = [
    {
      icon: <MdOutlineBedroomParent size={16} />,
      label: "Habitaciones",
      value: bedRooms?.length ?? 0,
    },
    {
      icon: <GiBunkBeds size={16} />,
      label: "Camas",
      value: bedRooms?.reduce((t, r) => t + (r.beds || 0), 0) ?? 0,
    },
    {
      icon: <FaPeopleRoof size={16} />,
      label: "Capacidad",
      value: `${maxGuests} pers.`,
    },
    {
      icon: <FaCarTunnel size={16} />,
      label: "Parqueadero",
      value: parking ? "Sí" : "No",
    },
    {
      icon: <MdOutlinePets size={16} />,
      label: "Mascotas",
      value: petsAllowed === "true" ? "Sí" : "No",
    },
  ];

  return (
    <div key={language}>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${title} · ${name}`}
        closeOnOverlayClick={false}
        className="!w-full h-auto md:!w-[1100px] max-h-[80vh] overflow-y-auto"
      >
        {!getPay && (
          <div className="flex flex-col md:flex-row gap-4 md:gap-5">
            {/* ── Left: gallery / map ── */}
            <div
              className={`relative h-[270px] md:h-[560px] w-full md:w-[50%] flex-shrink-0 rounded-xl overflow-hidden md:sticky md:top-0 ${
                showMap ? "md:order-2" : "md:order-1"
              }`}
            >
              <div className="absolute inset-0">
                {showMap ? (
                  coords ? (
                    <Map lat={coords.lat} lng={coords.lng} label={title} />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <ImSpinner9
                        className="animate-spin text-cyan-700"
                        size={36}
                      />
                    </div>
                  )
                ) : (
                  <Cardsinfo files={files} />
                )}
              </div>

              {/* toggle map/photos */}
              <div className="absolute bottom-3 right-3 z-20">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-1.5 bg-white/90 hover:bg-white backdrop-blur-sm text-cyan-800 text-xs font-semibold px-3 py-2 rounded-xl shadow-lg border border-white/50 transition-all"
                >
                  {showMap ? (
                    <>
                      <FaImage size={13} /> Ver fotos
                    </>
                  ) : (
                    <>
                      <FaMapMarkedAlt size={13} /> Ver mapa
                    </>
                  )}
                </button>
              </div>

              {/* video button */}
              {videos && videoUrl && (
                <div className="absolute top-3 right-3 z-20">
                  <button
                    onClick={() => setShowVideo(true)}
                    className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-xl border border-white/20 hover:bg-black/70 transition"
                  >
                    ▶ Ver video
                  </button>
                </div>
              )}
            </div>

            {/* ── Right: info panel ── */}
            <div
              className={`flex flex-col flex-1 min-w-0 ${
                showMap ? "md:order-1" : "md:order-2"
              }`}
            >
              <div className="space-y-4">
                {/* Title + actions */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900 text-base md:text-lg leading-snug">
                      {title}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {country} · {city} · {neigborhood}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded-full">
                      #{codigo}
                    </span>
                    <IoHeartCircleSharp
                      size={28}
                      className="cursor-pointer text-gray-300 hover:text-red-500 transition-colors"
                      onClick={() => {
                        if (!storedUserId) {
                          router.push(route.auth);
                          return;
                        }
                        const cleanedBedRooms = bedRooms.map(
                          ({ name, beds }) => ({ name, beds }),
                        );
                        mutate({
                          iduser: storedUserId,
                          property,
                          name,
                          anfitrion,
                          bedRooms: cleanedBedRooms,
                          maxGuests: Number(maxGuests),
                          neigborhood,
                          city,
                          country,
                          address,
                          amenities,
                          codigo,
                          parking,
                          petsAllowed: petsAllowed === "true",
                          smokingAllowed: false,
                          eventsAllowed: false,
                          status: true,
                          price: Number(pricePerDay),
                          currency,
                          cleaningFee,
                          deposit: Number(deposit),
                          promotion,
                          ruleshome: rulesHome,
                          description,
                          nameUnit: name,
                          image,
                          videoUrl: videos?.[0],
                          videos,
                        });
                      }}
                    />
                  </div>
                </div>

                {/* Host + Price card */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-3 border border-cyan-100/70">
                  <Avatar
                    src={
                      imageName && imageName.trim() !== ""
                        ? imageName
                        : "/complex.jpg"
                    }
                    alt={anfitrion}
                    size="md"
                    border="thick"
                    shape="rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                      Anfitrión
                    </p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {anfitrion}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {promotion && Number(promotion) > 0 && (
                      <span className="inline-block bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 mb-1">
                        -{promotion}%
                      </span>
                    )}
                    <p className="text-[10px] text-gray-400 line-through leading-none">
                      {formatCurrency(Number(pricePerDay))}
                    </p>
                    <p className="text-base font-bold text-cyan-700 leading-tight">
                      {formatCurrency(discountedPrice)}
                      <span className="text-[10px] font-normal text-gray-500">
                        {" "}
                        /noche
                      </span>
                    </p>
                  </div>
                </div>

                {/* Amenities */}
                {amenities.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Amenidades
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {amenities.map((aId) => {
                        const found = amenitiesOptions.find(
                          (opt) => opt.value === aId,
                        );
                        return (
                          <span
                            key={aId}
                            className="text-[11px] bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-0.5 rounded-full font-medium"
                          >
                            {found ? found.label : aId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Description + Rules */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">
                      Descripción
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {description}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <p className="text-[10px] font-bold uppercase text-amber-500 tracking-wide mb-1">
                      Reglas del hogar
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {rulesHome}
                    </p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"
                    >
                      <span className="text-cyan-600 flex-shrink-0">
                        {stat.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 leading-none">
                          {stat.label}
                        </p>
                        <p className="text-xs font-semibold text-gray-800 mt-0.5">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Date picker */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Fechas de estancia
                  </p>
                  <button
                    onClick={() => setShowCalendar(true)}
                    className={`w-full rounded-xl px-4 py-3 flex items-center justify-between border-2 transition-all duration-200 ${
                      startDate && endDate
                        ? "border-cyan-500 bg-cyan-50 text-cyan-800"
                        : "border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-cyan-400 hover:bg-cyan-50/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FaCalendarAlt
                        className={
                          startDate && endDate
                            ? "text-cyan-600 flex-shrink-0"
                            : "text-gray-400 flex-shrink-0"
                        }
                        size={14}
                      />
                      <span className="text-sm font-medium truncate">
                        {startDate && endDate
                          ? `${formatDate(startDate)} → ${formatDate(endDate)}`
                          : "Selecciona tu llegada y salida"}
                      </span>
                    </div>
                    {totalDays > 0 && (
                      <span className="text-xs bg-cyan-200 text-cyan-800 font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                        {totalDays} noche{totalDays !== 1 ? "s" : ""}
                      </span>
                    )}
                  </button>
                </div>

                {/* Price summary */}
                {totalDays > 0 && (
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 text-white">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      Resumen de pago
                    </p>
                    {isPending ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <ImSpinner9 className="animate-spin" size={14} />
                        <span className="text-xs">Calculando...</span>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between text-gray-300">
                            <span>
                              {totalDays} noche{totalDays !== 1 ? "s" : ""}
                            </span>
                            <span>{formatCurrency(subtotal)}</span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between text-green-400">
                              <span>Descuento</span>
                              <span>-{formatCurrency(discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-gray-300">
                            <span>Impuestos y cargos</span>
                            <span>{formatCurrency(taxes)}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/15 flex justify-between items-center">
                          <span className="font-bold text-white text-sm">
                            Total
                          </span>
                          <span className="font-bold text-xl text-cyan-400">
                            {formatCurrency(totalFinal)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pb-4">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={totalDays === 0}
                    onClick={() => setGetPay(true)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-200/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    Generar reserva
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {getPay && startDate && endDate && (
          <Form
            priceTotal={totalFinal}
            holidayId={id}
            maxGuests={Number(maxGuests)}
            startDate={startDate.toISOString()}
            endDate={endDate.toISOString()}
            onBack={() => setGetPay(false)}
          />
        )}
      </Modal>

      {/* ── Calendar modal ── */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-3">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-[780px] max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-700 to-blue-800 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <FaCalendarAlt className="text-white" size={16} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">
                    Selecciona tus fechas
                  </p>
                  <p className="text-cyan-200/80 text-xs">
                    Llegada y salida de tu estancia
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCalendar(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all"
              >
                <IoClose size={18} />
              </button>
            </div>

            {/* Info pills */}
            <div className="flex flex-wrap gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 flex-shrink-0">
              <span className="flex items-center gap-1.5 bg-cyan-50 text-cyan-700 text-xs px-3 py-1 rounded-full border border-cyan-200 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                Mínimo 2 noches
              </span>
              <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs px-3 py-1 rounded-full border border-orange-200 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Máximo 25 noches
              </span>
              {disabledDates.length > 0 && (
                <span className="flex items-center gap-1.5 bg-red-50 text-red-500 text-xs px-3 py-1 rounded-full border border-red-200 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {disabledDates.length} fechas ocupadas
                </span>
              )}
            </div>

            {/* Calendar */}
            <div className="overflow-auto flex-1 flex justify-center p-3">
              <DateRange
                ranges={dateRange as DateRangeItem}
                onChange={(ranges: RangeKeyDictLocal) => {
                  const selection = ranges.selection;
                  const { startDate, endDate } = selection;

                  setDateRange([selection]);

                  if (!startDate || !endDate) return;
                  if (startDate.getTime() === endDate.getTime()) return;

                  const diffDays = Math.ceil(
                    (endDate.getTime() - startDate.getTime()) /
                      (1000 * 60 * 60 * 24),
                  );

                  if (diffDays < 2 || diffDays > 25) {
                    showAlert("La estancia debe ser entre 2 y 25 días", "info");
                    return;
                  }

                  if (hasBlockedInRange(startDate, endDate)) {
                    showAlert("El rango incluye fechas no disponibles", "info");
                    setDateRange([
                      {
                        startDate: undefined,
                        endDate: undefined,
                        key: "selection",
                      },
                    ]);
                    return;
                  }

                  setShowCalendar(false);
                }}
                moveRangeOnFirstSelection={false}
                months={isMobile ? 1 : 2}
                direction={isMobile ? "vertical" : "horizontal"}
                rangeColors={["#155e75"]}
                locale={es}
                minDate={new Date()}
                maxDate={new Date(endeDate)}
                disabledDates={disabledDates}
              />
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center flex-shrink-0 bg-gray-50">
              {startDate &&
              endDate &&
              startDate.getTime() !== endDate.getTime() ? (
                <p className="text-xs text-cyan-700 font-semibold">
                  {formatDate(startDate)} → {formatDate(endDate)} ·{" "}
                  <span className="text-cyan-500">{totalDays} noches</span>
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Elige la fecha de llegada primero
                </p>
              )}
              <button
                onClick={() => setShowCalendar(false)}
                className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Video modal ── */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-[860px]">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-5 py-4 flex items-center justify-between">
              <p className="text-white font-bold text-sm">
                Video de la propiedad
              </p>
              <button
                onClick={() => setShowVideo(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all"
              >
                <IoClose size={18} />
              </button>
            </div>
            <div className="p-4">
              {videos?.length ? (
                <video
                  controls
                  className="w-full rounded-xl shadow-lg"
                  src={videoName}
                />
              ) : videoUrl ? (
                <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl">
                  <iframe
                    src={videoUrl.replace("watch?v=", "embed/")}
                    title="Video de la propiedad"
                    className="absolute top-0 left-0 w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8 text-sm">
                  No hay video disponible
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
