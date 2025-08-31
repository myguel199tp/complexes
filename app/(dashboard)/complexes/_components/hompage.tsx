"use client";
import React, { useTransition } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
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

export default function Homepage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { countryOptions, data } = useCountryCityOptions();

  const { filteredData } = ImmovablesInfo();
  const { filteredDataHollliday } = HolidayInfo();

  const handleClick = () => {
    startTransition(() => {
      router.push(route.registerComplex);
    });
  };

  return (
    <>
      {/* HERO */}
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center min-h-max bg-gradient-to-r from-blue-50 via-white to-blue-50 px-2">
        {/* Texto principal */}
        <div className="w-full md:w-[40%]">
          <Title size="md" as="h1" font="bold" className="text-4xl">
            TU CONJUNTO, MÁS CONECTADO QUE NUNCA
          </Title>
          <Text as="h5" className="mt-2 text-gray-700">
            Una app hecha para propietarios, con propietarios en mente
          </Text>

          <div className="flex gap-4 mt-4">
            <Button
              className="flex gap-2 items-center justify-center hover:scale-105 transition-transform"
              colVariant="warning"
              rounded="md"
              size="full"
              onClick={handleClick}
            >
              Inscribir conjunto
              {isPending ? (
                <ImSpinner9 className="animate-spin text-base mr-2" />
              ) : null}
            </Button>
          </div>
        </div>

        {/* Slider */}
        <div className="w-full md:w-[60%] h-[40%]">
          <Swiper
            spaceBetween={5}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={true}
            modules={[Pagination, Autoplay]}
            className="mySwiper"
          >
            {[
              {
                img: "/apartamento.jpeg",
                text: "El hogar es un lugar donde buscar descansar y tener paz",
              },
              {
                img: "/family.jpg",
                text: "Un hogar es el lugar donde tu familia construye una nueva y gran historia",
              },
              {
                img: "/montaña.jpeg",
                text: "Una hermosa vista a la montaña y campo a tu alrededor encuentra tu lugar perfecto",
              },
              {
                img: "/playa.jpeg",
                text: "Encuentra una casa o apartamento cerca al mar donde puedas disfrutar de un hermoso amanecer",
              },
            ].map((slide, i) => (
              <SwiperSlide key={i} className="rounded-lg">
                <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
                  <Image
                    className="rounded-lg"
                    fill
                    style={{ objectFit: "cover" }}
                    alt={`slide-${i}`}
                    src={slide.img}
                  />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                    <Text
                      size="lg"
                      font="bold"
                      className="text-white drop-shadow-md"
                    >
                      {slide.text}
                    </Text>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Beneficios */}
      <div className="bg-white py-12 px-6">
        <Title as="h2" size="sm" font="bold" className="text-3xl text-center">
          ¿Por qué elegirnos?
        </Title>
        <div className="flex w-full justify-end items-end">
          <Button colVariant="warning" onClick={() => router.push(route.us)}>
            Ver todos
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center mt-8">
          {[
            {
              icon: "🔒",
              title: "Seguridad",
              text: "Accede a tu conjunto con confianza y transparencia.",
            },
            {
              icon: "💬",
              title: "Comunicación",
              text: "Mantente siempre conectado con tus vecinos.",
            },
            {
              icon: "🏘️",
              title: "Comunidad",
              text: "Construye relaciones más fuertes en tu conjunto.",
            },
            {
              icon: "🏖️",
              title: "Alquiler vacacional",
              text: "Encuentra el lugar ideal para tus vacaciones o renta tu propiedad de forma segura.",
            },
            {
              icon: "💰",
              title: "Arrienda o vende",
              text: "Publica fácilmente tu inmueble para venta o arriendo y llega a más personas.",
            },
            {
              icon: "👥",
              title: "Gestión de usuarios",
              text: "Registra hasta 4 subusuarios por vivienda con accesos diferenciados.",
            },
          ].map((b, i) => (
            <div
              key={i}
              className="p-6 bg-blue-50 rounded-2xl shadow-sm hover:shadow-md transition"
            >
              <div className="text-4xl">{b.icon}</div>
              <h3 className="text-xl font-bold mt-2">{b.title}</h3>
              <p className="text-gray-600 mt-1">{b.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contadores */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-400 text-white py-12 text-center">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-4xl font-bold">+500</h3>
            <p>Conjuntos inscritos</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold">+2000</h3>
            <p>Propietarios felices</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold">+300</h3>
            <p>Inmuebles disponibles</p>
          </div>
        </div>
      </div>

      {/* Inmuebles destacados */}
      {filteredData.length > 0 && (
        <div className="py-12 px-6">
          <Title size="sm" as="h2" font="bold" className="text-4xl">
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
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Alquileres destacados */}
      {filteredDataHollliday.length > 0 && (
        <div className="py-12 px-6">
          <Title size="sm" as="h2" font="bold" className="text-4xl">
            Alquileres destacados
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
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
