"use client";
import React, { useTransition } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay, A11y } from "swiper/modules";
import Image from "next/image";
import "./style.css";
import { Button, Text, Title } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { ImSpinner9 } from "react-icons/im";
import { Cardinfo as Cardinfoinmueble } from "../../immovables/_components/card-immovables/card-info";
import ImmovablesInfo from "../../immovables/_components/immovables-info";
import HolidayInfo from "../../holiday/_components/holiday-info";
import { useCountryCityOptions } from "../../registers/_components/register-option";
import Cardinfo from "../../holiday/_components/card-holiday/card-info";
import { useTranslation } from "react-i18next";

export default function Homepage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPendingAll, startTransitionAll] = useTransition();
  const { countryOptions, data } = useCountryCityOptions();

  const { filteredData } = ImmovablesInfo();
  const { filteredDataHollliday } = HolidayInfo();

  const handleClick = () => {
    startTransition(() => {
      router.push(route.registerComplex);
    });
  };

  const handleClickAll = () => {
    startTransitionAll(() => {
      router.push(route.us);
    });
  };

  const { t } = useTranslation();

  return (
    <>
      {/* HERO */}
      <section
        className="flex flex-col md:flex-row gap-4 justify-center items-center min-h-max bg-gradient-to-r from-blue-50 via-white to-blue-50 px-2"
        aria-labelledby="hero-title"
      >
        {/* Texto principal */}
        <div className="w-full md:w-[40%]">
          <Title
            id="hero-title"
            size="md"
            as="h1"
            font="bold"
            className="text-4xl"
            translate="yes"
            tKey={t("mensajeInfo")}
          >
            TU CONJUNTO, MÁS CONECTADO QUE NUNCA
          </Title>
          <Text
            size="md"
            className="mt-2 text-gray-700"
            tKey={t("subMensajeInfo")}
            translate="yes"
          >
            Una app hecha para propietarios, con propietarios en mente
          </Text>

          <div className="flex gap-4 mt-4">
            <Button
              className="flex gap-2 items-center justify-center hover:scale-105 transition-transform"
              colVariant="warning"
              rounded="md"
              size="full"
              onClick={handleClick}
              aria-label={t("inscripcion")}
              tKey={t("inscripcion")}
              translate="yes"
            >
              {t("inscripcion")}
              {isPending ? (
                <ImSpinner9
                  className="animate-spin text-base mr-2"
                  aria-hidden="true"
                />
              ) : null}
            </Button>
          </div>
        </div>

        {/* Slider accesible */}
        <div className="w-full md:w-[60%] h-[40%]">
          <Swiper
            spaceBetween={5}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={true}
            modules={[Pagination, Autoplay, A11y]}
            className="mySwiper"
            aria-label="Galería de imágenes destacadas"
          >
            {[
              { img: "/apartamento.jpeg", key: "slider_apartamento" },
              { img: "/family.jpg", key: "slider_familia" },
              { img: "/montaña.jpeg", key: "slider_montana" },
              { img: "/playa.jpeg", key: "slider_playa" },
            ].map((slide, i) => (
              <SwiperSlide
                key={i}
                className="rounded-lg"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} de 4`}
              >
                <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
                  <Image
                    className="rounded-lg"
                    fill
                    style={{ objectFit: "cover" }}
                    alt={t(slide.key)} // alt descriptivo
                    src={slide.img}
                  />
                  <div className="absolute top-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-6">
                    <Title
                      as="h3"
                      size="md"
                      font="bold"
                      colVariant="on"
                      className="drop-shadow-md"
                    >
                      {t(slide.key)}
                    </Title>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Alquileres destacados */}
      {filteredDataHollliday.length > 0 && (
        <section className="py-12 px-6" aria-labelledby="featured-holidays">
          <Title
            id="featured-holidays"
            size="sm"
            tKey={t("hollidayDestacado")}
            as="h2"
            font="bold"
            className="text-4xl"
          >
            Alquileres vacacionales destacados
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {filteredDataHollliday.slice(0, 3).map((e) => {
              const infodata = e.files.map((file) =>
                typeof file === "string" ? file : file.filename
              );
              const countryLabel =
                countryOptions.find((c) => c.value === String(e.country))
                  ?.label || e.country;
              const cityLabel =
                data
                  ?.find((c) => String(c.ids) === String(e.country))
                  ?.city.find((c) => String(c.id) === String(e.city))?.name ||
                e.city;
              return (
                <Cardinfo
                  amenities={[]}
                  codigo={""}
                  key={e.id}
                  files={infodata}
                  city={cityLabel}
                  neigborhood={e.neigborhood}
                  parking={e.parking}
                  price={e.price}
                  property={countryLabel}
                  country={e.country}
                  description={e.description}
                  address={e.address}
                  apartment={e.apartment}
                  cel={e.cel}
                  endDate={e.endDate}
                  maxGuests={e.maxGuests}
                  name={e.name}
                  nameUnit={e.nameUnit}
                  petsAllowed={e.petsAllowed}
                  promotion={e.promotion}
                  ruleshome={e.ruleshome}
                  startDate={e.startDate}
                  aria-label={`Alquiler en ${cityLabel}, ${countryLabel}`}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Beneficios */}
      <section
        className="bg-gray-100 rounded-md mt-4 py-12 px-6"
        aria-labelledby="benefits-title"
      >
        <Title
          id="benefits-title"
          as="h2"
          size="sm"
          tKey={t("elegirnos")}
          translate="yes"
          font="bold"
          className="text-3xl text-center"
        >
          ¿Por qué elegirnos?
        </Title>

        <div className="flex w-full justify-end items-end">
          <Button
            colVariant="warning"
            className="flex gap-2"
            onClick={handleClickAll}
            aria-label={t("verTodo")}
          >
            {t("verTodo")}
            {isPendingAll ? (
              <ImSpinner9 className="animate-spin text-base mr-2" />
            ) : null}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center mt-8" role="list">
          {[
            {
              icon: "🔒",
              title: t("beneficios.0.title"),
              text: t("beneficios.0.text"),
            },
            {
              icon: "💬",
              title: t("beneficios.1.title"),
              text: t("beneficios.1.text"),
            },
            {
              icon: "🏘️",
              title: t("beneficios.2.title"),
              text: t("beneficios.2.text"),
            },
            {
              icon: "🏖️",
              title: t("beneficios.3.title"),
              text: t("beneficios.3.text"),
            },
            {
              icon: "💰",
              title: t("beneficios.4.title"),
              text: t("beneficios.4.text"),
            },
            {
              icon: "👥",
              title: t("beneficios.5.title"),
              text: t("beneficios.5.text"),
            },
          ].map((b, i) => (
            <div
              key={i}
              role="listitem"
              className="p-6 bg-blue-50 rounded-2xl shadow-sm hover:shadow-md transition"
            >
              <div className="text-4xl" aria-hidden="true">
                {b.icon}
              </div>
              <Title size="md" font="bold">
                {b.title}
              </Title>
              <Text size="md">{b.text}</Text>
            </div>
          ))}
        </div>
      </section>

      {filteredData.length > 0 && (
        <section className="py-12 px-6" aria-labelledby="featured-immovables">
          <Title
            id="featured-immovables"
            tKey={t("inmueblesdestacados")}
            size="sm"
            as="h2"
            font="bold"
            className="text-4xl"
          >
            Inmuebles destacados
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {filteredData.slice(0, 3).map((e) => {
              const infodata = e.files.map((file) =>
                typeof file === "string" ? file : file.filename
              );
              const countryLabel =
                countryOptions.find((c) => c.value === String(e.country))
                  ?.label || e.country;
              const cityLabel =
                data
                  ?.find((c) => String(c.ids) === String(e.country))
                  ?.city.find((c) => String(c.id) === String(e.city))?.name ||
                e.city;
              return (
                <Cardinfoinmueble
                  key={e.id}
                  area={e.area}
                  property={e.property}
                  images={infodata}
                  country={countryLabel}
                  city={cityLabel}
                  neighborhood={e.neighborhood}
                  ofert={e.ofert === "1" ? "Venta" : "Arriendo"}
                  parking={e.parking}
                  price={e.price}
                  restroom={e.restroom}
                  room={e.room}
                  id={e.id}
                  administration={e.administration}
                  stratum={e.stratum}
                  age={e.age}
                  phone={e.phone}
                  email={e.email}
                  description={e.description}
                  aria-label={`Inmueble en ${cityLabel}, ${countryLabel}`}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Contadores */}
      <section
        className="bg-gradient-to-r from-cyan-600 to-blue-400 text-white py-12 text-center"
        aria-label="Estadísticas de la aplicación"
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <Title as="h3" className="text-4xl font-bold">
              +500
            </Title>
            <Text size="sm">{t("conjunto")}</Text>
          </div>
          <div>
            <Title as="h3" className="text-4xl font-bold">
              +2000
            </Title>
            <Text size="sm">{t("propietarios")}</Text>
          </div>
          <div>
            <Title as="h3" className="text-4xl font-bold">
              +300
            </Title>
            <Text size="sm">{t("disponibles")}</Text>
          </div>
        </div>
      </section>
    </>
  );
}
