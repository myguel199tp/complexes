"use client";

import {
  Button,
  Modal,
  Title,
  Text,
  Avatar,
  Badge,
} from "complexes-next-components";
import React, { useState, useMemo, useEffect } from "react";
import Cardsinfo from "./cards-info";
import Map from "./map";
import { FaImage, FaMapMarkedAlt, FaCalendarAlt } from "react-icons/fa";
import RegisterOptions from "@/app/(panel)/my-holliday/_components/holliday/_components/register-options";
import { DateRange } from "react-date-range";
import { es } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { IoHeartCircleSharp } from "react-icons/io5";
import { CreateBedRoomDto } from "../../../services/response/holidayResponses";

interface LocalRange {
  startDate?: Date;
  endDate?: Date;
  key: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
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
}

export default function ModalHolliday(props: Props) {
  const {
    isOpen,
    onClose,
    title,
    pricePerDay,
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
  } = props;

  const [dateRange, setDateRange] = useState<LocalRange[]>([
    { startDate: undefined, endDate: undefined, key: "selection" },
  ]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const [getPay, setGetPay] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const { amenitiesOptions } = RegisterOptions();

  const startDate = dateRange[0].startDate;
  const endDate = dateRange[0].endDate;

  const totalDays = useMemo(() => {
    if (startDate && endDate) {
      const diff = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diff > 0 ? diff : 0;
    }
    return 0;
  }, [startDate, endDate]);

  const totalPrice = useMemo(() => {
    const base = totalDays * (Number(pricePerDay) || 0);
    const promo = Number(promotion) || 0;
    const discount = (base * promo) / 100;
    return base - discount;
  }, [totalDays, pricePerDay, promotion]);

  const taxRate = 0.19;
  const taxAmount = totalPrice * taxRate;
  const totalWithTax = totalPrice + taxAmount;
  const cleaningFeeNumber =
    Number(String(cleaningFee).replace(/[^0-9.-]+/g, "")) || 0;
  const depositFeeNumber =
    Number(String(deposit).replace(/[^0-9.-]+/g, "")) || 0;

  const totalFinal = totalWithTax + cleaningFeeNumber + depositFeeNumber;

  // 🔹 Función segura para formatear moneda
  const formatCurrency = (value: number) => {
    const currencyCode = currency || "COP"; // fallback
    let locale = "es-CO";

    if (currencyCode === "USD") locale = "en-US";
    else if (currencyCode === "EUR") locale = "de-DE";

    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
      }).format(value || 0);
    } catch (err) {
      console.error("Error formatting currency:", currencyCode, err);
      return value.toFixed(2);
    }
  };

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const imageName = image
    ? `${BASE_URL}/uploads/${image.replace(/^.*[\\/]/, "")}`
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
          `https://nominatim.openstreetmap.org/search?${params.toString()}`
        );
        const data: { lat: string; lon: string }[] = await res.json();
        if (data.length > 0)
          setCoords({ lat: +data[0].lat, lng: +data[0].lon });
      } catch (err) {
        console.error("Error geocoding:", err);
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

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${title} ${name}`}
        closeOnOverlayClick={false}
        className="w-[1900px] h-[950px] max-h-[95vh]"
      >
        {!getPay && (
          <div className="flex flex-col md:flex-row h-full gap-4 bg-gray-200 overflow-hidden transition-all duration-500 ease-in-out">
            {/* 🖼️ Mapa o imágenes */}
            <div
              className={`relative rounded-xl overflow-hidden shadow-md flex-1 min-h-[500px] md:min-h-[600px] ${
                showMap ? "order-2" : "order-1"
              }`}
            >
              <div className="absolute inset-0">
                {showMap ? (
                  coords ? (
                    <Map lat={coords.lat} lng={coords.lng} label={title} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Cargando mapa...
                    </div>
                  )
                ) : (
                  <Cardsinfo files={files} />
                )}
              </div>
              <div className="absolute bottom-3 right-3 z-20">
                <Button
                  colVariant="primary"
                  size="md"
                  rounded="lg"
                  onClick={() => setShowMap(!showMap)}
                >
                  {showMap ? (
                    <FaImage className="mr-2" />
                  ) : (
                    <FaMapMarkedAlt className="mr-2" />
                  )}
                </Button>
              </div>
            </div>

            {/* 📝 Información del hospedaje */}
            <div
              className={`flex flex-col bg-white rounded-xl shadow-md p-6 overflow-y-auto w-full md:w-[45%] ${
                showMap ? "order-1" : "order-2"
              }`}
            >
              <div className="flex justify-between items-center">
                <Title as="h2" size="md" font="bold" className="mb-2">
                  {title}
                </Title>
                <div className="flex gap-2 items-center">
                  <Button
                    size="sm"
                    colVariant="warning"
                    rounded="lg"
                    onClick={() => setShowVideo(true)}
                  >
                    Ver video
                  </Button>
                  <IoHeartCircleSharp size={33} />
                  <Text size="md" font="bold">
                    {codigo}
                  </Text>
                </div>
              </div>

              <div className="flex gap-6">
                <Avatar
                  src={
                    imageName && imageName.trim() !== ""
                      ? imageName
                      : "/complex.jpg"
                  }
                  alt="complex"
                  size="lg"
                  border="thick"
                  shape="rounded"
                />
                <div className="w-full flex justify-between items-center">
                  <div>
                    <Text size="md" font="semi">
                      {country} - {city} - {neigborhood}
                    </Text>
                    <Text size="md">
                      Anfitrión:{" "}
                      <Text size="md" font="bold">
                        {anfitrion}
                      </Text>
                    </Text>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      size="md"
                      colVariant="success"
                      background="success"
                      rounded="lg"
                      font="bold"
                    >
                      - {promotion} %
                    </Badge>
                    <div>
                      <Text
                        size="md"
                        font="semi"
                        className="line-through text-gray-400"
                      >
                        {formatCurrency(Number(pricePerDay))} por noche
                      </Text>
                      <Text size="md" font="bold" className="text-green-600">
                        {currency}{" "}
                        {formatCurrency(
                          Number(pricePerDay) -
                            (Number(pricePerDay) * Number(promotion)) / 100
                        )}{" "}
                        por noche
                      </Text>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <Text size="md">
                  Amenidades:{" "}
                  <Text size="sm" font="semi">
                    {amenities
                      .map((id) => {
                        const found = amenitiesOptions.find(
                          (opt) => opt.value === id
                        );
                        return found ? found.label : id;
                      })
                      .join(" | ")}
                  </Text>
                </Text>
                <hr className="my-2" />
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Text size="md" font="semi">
                      Descripción
                    </Text>
                    <Text size="sm" className="my-2 flex-1">
                      {description}
                    </Text>
                  </div>
                  <div className="w-px bg-gray-300 h-12 mx-2"></div>
                  <div>
                    <Text size="md" font="semi">
                      Reglas de hogar
                    </Text>
                    <Text size="sm" className="my-2 flex-1">
                      {rulesHome}
                    </Text>
                  </div>
                </div>
                <hr className="my-2" />
                <div className="relative">
                  <Text size="md" className="my-2" font="bold">
                    Selecciona tus fechas llegada y salida
                  </Text>
                  <button
                    onClick={() => setShowCalendar(true)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 flex items-center justify-between text-sm hover:border-gray-400 transition"
                  >
                    <span>
                      {startDate && endDate
                        ? `${formatDate(startDate)} → ${formatDate(endDate)}`
                        : "Selecciona fecha de llegada y salida"}
                    </span>
                    <FaCalendarAlt className="text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <div className="space-y-1 text-sm text-gray-700">
                  <Text size="md">
                    Habitaciones:{" "}
                    <Text as="span" font="semi" size="md">
                      {bedRooms?.length}
                    </Text>{" "}
                    | Camas:{" "}
                    <Text as="span" font="semi" size="md">
                      {bedRooms?.reduce(
                        (total, room) => total + (room.beds || 0),
                        0
                      )}
                    </Text>
                  </Text>
                  <Text size="md">
                    Capacidad máxima:{" "}
                    <Text size="md" as="span" font="semi">
                      {maxGuests}
                    </Text>
                  </Text>
                  <Text size="md">
                    Parqueadero:{" "}
                    <Text size="md" as="span" font="semi">
                      {parking ? "Sí" : "No"}
                    </Text>
                  </Text>
                  <Text size="md">
                    Mascotas:{" "}
                    <Text size="md" as="span" font="semi">
                      {petsAllowed === "true"
                        ? "Aceptan mascotas"
                        : "No aceptan mascotas"}
                    </Text>
                  </Text>
                </div>
                {totalDays > 0 && (
                  <>
                    <div className="w-px bg-gray-300 h-12 mx-2"></div>

                    <div className="bg-white rounded-lg shadow-2xl">
                      <Text font="semi">Resumen de transacción</Text>
                      <Text size="md">
                        Días seleccionados:{" "}
                        <Text size="md" as="span" font="semi">
                          {totalDays}
                        </Text>
                      </Text>
                      <Text size="md">
                        Subtotal:{" "}
                        <Text as="span" font="semi" size="md">
                          {formatCurrency(totalPrice)}
                        </Text>
                      </Text>
                      <Text size="md">
                        Impuestos:{" "}
                        <Text as="span" font="semi" size="md">
                          {formatCurrency(taxAmount)}
                        </Text>
                      </Text>
                      <Text size="md">
                        Tarifa de limpieza:{" "}
                        <Text as="span" font="semi" size="md">
                          {formatCurrency(cleaningFeeNumber)}
                        </Text>
                      </Text>
                      <Text size="md">
                        Deposito:{" "}
                        <Text as="span" font="semi" size="md">
                          {formatCurrency(depositFeeNumber)}
                        </Text>
                      </Text>
                      <Text size="lg" font="bold">
                        Total: {formatCurrency(totalFinal)}
                      </Text>
                    </div>
                  </>
                )}
              </div>

              <hr className="my-4" />
            </div>
          </div>
        )}
        {getPay && <div>holaaa</div>}
        {/* BOTONES ABAJO */}
        <div className="flex justify-end gap-4 mt-1 border-t pt-1">
          <Button colVariant="danger" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colVariant="warning"
            disabled={totalDays === 0}
            onClick={() => setGetPay(!getPay)}
          >
            Generar reserva
          </Button>
        </div>
      </Modal>

      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[750px] max-w-full">
            <h3 className="font-semibold text-gray-800 mb-4 text-center">
              LLEGADA Y SALIDA
            </h3>
            <DateRange
              ranges={dateRange}
              onChange={(item: { selection: LocalRange }) => {
                const { startDate, endDate } = item.selection;
                if (startDate && endDate) {
                  const diffDays = Math.ceil(
                    (endDate.getTime() - startDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  if (diffDays > 25) {
                    const limitedEnd = new Date(startDate);
                    limitedEnd.setDate(startDate.getDate() + 25);
                    setDateRange([{ ...item.selection, endDate: limitedEnd }]);
                    return;
                  }
                }
                setDateRange([item.selection]);
                if (
                  startDate &&
                  endDate &&
                  startDate.getTime() !== endDate.getTime()
                )
                  setShowCalendar(false);
              }}
              moveRangeOnFirstSelection={false}
              months={2}
              direction="horizontal"
              rangeColors={["#155e75"]}
              locale={es}
              minDate={new Date()}
              maxDate={new Date(endeDate)}
            />
            <div className="flex justify-end mt-4">
              <Button
                colVariant="danger"
                onClick={() => setShowCalendar(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showVideo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[900px] max-w-full relative">
            <Text size="md" font="bold" className="mb-4 text-center">
              Video de la propiedad
            </Text>
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
              <iframe
                src={videoUrl.replace("watch?v=", "embed/")}
                title="Video de la propiedad"
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen
              ></iframe>
            </div>

            <div className="flex justify-end mt-4">
              <Button colVariant="danger" onClick={() => setShowVideo(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
