"use client";

import {
  Button,
  Modal,
  Title,
  Text,
  Avatar,
  Badge,
  Buton,
  Tooltip,
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
import Form from "./form";
import { useMutationFavorites } from "./favorites-mutation";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";

interface LocalRange {
  startDate?: Date;
  endDate?: Date;
  key: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
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

  console.log("ModalHolliday selected props:", {
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
  });

  const [dateRange, setDateRange] = useState<LocalRange[]>([
    { startDate: undefined, endDate: undefined, key: "selection" },
  ]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const router = useRouter();
  const payload = getTokenPayload();

  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

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

  const { mutate } = useMutationFavorites();
  const { t } = useTranslation();

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${title} ${name}`}
        closeOnOverlayClick={false}
        className="w-full h-auto md:!w-[1700px] md:!h-[850px] max-h-[95vh]"
      >
        {!getPay && (
          <div className="flex flex-col md:flex-row h-auto gap-4 overflow-y-auto max-h-[90vh] transition-all duration-500 ease-in-out">
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
                <Buton
                  colVariant="primary"
                  size="sm"
                  borderWidth="none"
                  rounded="lg"
                  onClick={() => setShowMap(!showMap)}
                >
                  {showMap ? (
                    <Tooltip
                      content="Ver Imagen"
                      position="top"
                      className="bg-gray-300 z-20"
                    >
                      <FaImage className="mr-2" size={20} />
                    </Tooltip>
                  ) : (
                    <Tooltip
                      content="Ver mapa"
                      position="top"
                      className="bg-gray-300 z-20"
                    >
                      <FaMapMarkedAlt className="mr-2" size={20} />
                    </Tooltip>
                  )}
                </Buton>
              </div>
            </div>

            {/* 📝 Información del hospedaje */}
            <div
              className={`flex flex-col bg-white rounded-xl shadow-md overflow-y-auto w-full md:w-[45%] ${
                showMap ? "order-1" : "order-2"
              }`}
            >
              <div className="flex justify-between items-center">
                <Title as="h2" size="xs" font="bold" className="mb-2">
                  {title}
                </Title>
                <div className="flex gap-2 items-center">
                  {videos && videoUrl && (
                    <Button
                      size="xs"
                      colVariant="warning"
                      rounded="lg"
                      onClick={() => setShowVideo(true)}
                    >
                      Ver video
                    </Button>
                  )}
                  <IoHeartCircleSharp
                    size={33}
                    className="cursor-pointer hover:text-red-600 transition-colors"
                    onClick={() => {
                      if (!storedUserId) {
                        router.push(route.auth);
                        return;
                      }

                      const cleanedBedRooms = bedRooms.map(
                        ({ name, beds }) => ({ name, beds })
                      );

                      const payload = {
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
                      };

                      mutate(payload);
                    }}
                  />

                  <Text size="xs" font="bold">
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
                    <Text size="sm" font="semi">
                      {country} - {city} - {neigborhood}
                    </Text>
                    <Text size="xs" tKey={t("anfitrion")}>
                      Anfitrión:{" "}
                      <Text size="xs" font="bold">
                        {anfitrion}
                      </Text>
                    </Text>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      size="xs"
                      colVariant="success"
                      background="success"
                      rounded="lg"
                      font="bold"
                    >
                      - {promotion} %
                    </Badge>
                    <div>
                      <Text
                        size="sm"
                        font="semi"
                        className="line-through text-gray-400"
                      >
                        {formatCurrency(Number(pricePerDay))}{" "}
                        <Text as="span" size="sm" tKey={t("noche")}>
                          por noche
                        </Text>
                      </Text>
                      <Text size="sm" font="bold" className="text-green-600">
                        {currency}{" "}
                        {formatCurrency(
                          Number(pricePerDay) -
                            (Number(pricePerDay) * Number(promotion)) / 100
                        )}{" "}
                        <Text as="span" size="sm" tKey={t("noche")}>
                          por noche
                        </Text>
                      </Text>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <Text tKey={t("amenidades")} size="xs">
                  Amenidades:
                  <Text size="xs" font="semi">
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
                    <Text size="xs" font="semi" tKey={t("descripcion")}>
                      Descripción
                    </Text>
                    <Text size="xs" className="my-2 flex-1">
                      {description}
                    </Text>
                  </div>
                  <div className="w-px bg-gray-300 h-12 mx-2"></div>
                  <div>
                    <Text size="xs" font="semi" tKey={t("reglasHogar")}>
                      Reglas de hogar
                    </Text>
                    <Text size="xs" className="my-2 flex-1">
                      {rulesHome}
                    </Text>
                  </div>
                </div>
                <hr className="my-2" />
                <div className="relative">
                  <Text
                    size="xs"
                    className="my-2"
                    font="bold"
                    tKey={t("llegadaSalida")}
                  >
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
                  <Text size="xs" tKey={t("habitaciones")}>
                    Habitaciones:{" "}
                    <Text as="span" font="semi" size="xs">
                      {bedRooms?.length}
                    </Text>{" "}
                    <Text as="span" size="xs" tKey={t("camas")}>
                      Camas:{" "}
                    </Text>
                    <Text as="span" font="semi" size="xs">
                      {bedRooms?.reduce(
                        (total, room) => total + (room.beds || 0),
                        0
                      )}
                    </Text>
                  </Text>
                  <Text size="xs" tKey={t("capacidadmax")}>
                    Capacidad máxima:{" "}
                    <Text size="xs" as="span" font="semi">
                      {maxGuests}
                    </Text>
                  </Text>
                  <Text size="xs" tKey={t("parqueo")}>
                    Parqueadero:{" "}
                    <Text size="xs" as="span" font="semi">
                      {parking ? "Sí" : "No"}
                    </Text>
                  </Text>
                  <Text size="xs" tKey={t("mascot")}>
                    Mascotas:{" "}
                    <Text size="xs" as="span" font="semi">
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
                      <Text font="semi" tKey={t("transacionresumen")}>
                        Resumen de transacción
                      </Text>
                      <Text size="xs" tKey={t("diaseleccion")}>
                        Días seleccionados:{" "}
                        <Text size="xs" as="span" font="semi">
                          {totalDays}
                        </Text>
                      </Text>
                      <Text size="xs" tKey={t("subtotal")}>
                        Subtotal:{" "}
                        <Text as="span" font="semi" size="xs">
                          {formatCurrency(totalPrice)}
                        </Text>
                      </Text>
                      <Text size="xs" tKey={t("impuestos")}>
                        Impuestos:{" "}
                        <Text as="span" font="semi" size="xs">
                          {formatCurrency(taxAmount)}
                        </Text>
                      </Text>
                      <Text size="xs" tKey={t("tarifalimpieza")}>
                        Tarifa de limpieza:{" "}
                        <Text as="span" font="semi" size="xs">
                          {formatCurrency(cleaningFeeNumber)}
                        </Text>
                      </Text>
                      <Text size="xs" tKey={t("deposito")}>
                        Deposito:{" "}
                        <Text as="span" font="semi" size="xs">
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
              <div className="flex justify-start items-start gap-4 mt-4 border-t pt-1">
                <Button
                  colVariant="danger"
                  size="sm"
                  rounded="lg"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  colVariant="warning"
                  size="sm"
                  rounded="lg"
                  disabled={totalDays === 0}
                  onClick={() => setGetPay(!getPay)}
                >
                  Generar reserva
                </Button>
              </div>
            </div>
          </div>
        )}
        {getPay && <Form />}
      </Modal>

      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[750px] max-w-full">
            <Title as="h3" font="semi" className="mb-4 text-center">
              LLEGADA Y SALIDA
            </Title>
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
                tKey={t("cerrar")}
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
            <Text
              tKey={t("videpropiedad")}
              size="xs"
              font="bold"
              className="mb-4 text-center"
            >
              Video de la propiedad
            </Text>

            {/* Renderiza solo si existe videos (archivo subido localmente) */}
            {videos?.length ? (
              <video
                controls
                className="w-full max-w-3xl mx-auto rounded-lg shadow-lg"
                src={videoName}
              />
            ) : videoUrl ? (
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                <iframe
                  src={videoUrl.replace("watch?v=", "embed/")}
                  title={t("videpropiedad")}
                  className="absolute top-0 left-0 w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <Text className="text-center text-gray-500">
                No hay video disponible
              </Text>
            )}

            <div className="flex justify-end mt-2">
              <Button
                colVariant="danger"
                size="sm"
                onClick={() => setShowVideo(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
