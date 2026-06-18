/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination, Autoplay, A11y, Navigation } from "swiper/modules";
import Image from "next/image";
import "./style.css";
import { Button, Text, Title } from "complexes-next-components";
import { ImSpinner9 } from "react-icons/im";
import { Cardinfo as Cardinfoinmueble } from "../../immovables/_components/card-immovables/card-info";
import HomepageInfo from "./homepage-info";
import FooterComplex from "./footerComplex";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import Reveal from "./Reveal";
import { FaWhatsapp } from "react-icons/fa";

export default function Homepage() {
  const {
    isPendingAll,
    countryOptions,
    data,
    filteredData,
    t,
    language,
    handleClick,
  } = HomepageInfo();
  const router = useRouter();
  const advisors = [
    "573003066369",
    "573246829832",
    "573007908880",
    "573044156317",
  ];

  const randomAdvisor = advisors[Math.floor(Math.random() * advisors.length)];

  const whatsappUrl = `https://wa.me/${randomAdvisor}?text=Hola,%20quiero%20una%20demostración%20de%20SmartPH`;

  return (
    <div key={language}>
      <Reveal>
        <section
          className="
    relative
    overflow-hidden
    px-2
    sm:px-3
    md:px-4
    xl:px-6
    py-2
  "
        >
          {/* BACKGROUND GLOW */}
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-cyan-500/10 blur-[120px] rounded-full" />

          <div className="absolute -bottom-40 -right-32 w-[420px] h-[420px] bg-blue-600/10 blur-[120px] rounded-full" />

          {/* GRID */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `
        linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)
      `,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 w-full max-w-[1400px] mx-auto">
            <Swiper
              spaceBetween={10}
              pagination={{ clickable: true }}
              navigation={true}
              autoplay={{
                delay: 8000,
                disableOnInteraction: false,
              }}
              loop
              modules={[Pagination, Autoplay, A11y, Navigation]}
              className="mySwiper rounded-[24px] md:rounded-[32px] overflow-hidden"
            >
              {[
                {
                  img: "/cartera.jpg",
                  info: "Conjuntos que evolucionan",
                  subInfo:
                    "Una administración moderna proyecta innovación, organización y aumenta el valor percibido del conjunto.",
                  pills: [
                    "Mayor valorización",
                    "Imagen moderna",
                    "Administración innovadora",
                    "Mayor confianza",
                    "Mejor percepción residencial",
                  ],
                },
                {
                  img: "/comunicacion.jpg",
                  info: "Menos gastos innecesarios",
                  subInfo:
                    "Reduce costos operativos y optimiza recursos administrativos del día a día.",
                  pills: [
                    "Ahorro operativo",
                    "Menos papel",
                    "Procesos digitales",
                    "Optimización de recursos",
                    "Reducción de costos",
                  ],
                },
                {
                  img: "/votaciones.png",
                  info: "Todo al alcance",
                  subInfo:
                    "Gestiona pagos, solicitudes y comunicaciones desde cualquier lugar y en cualquier momento.",
                  pills: [
                    "Acceso 24/7",
                    "Gestión desde el celular",
                    "Comunicación inmediata",
                    "Mayor comodidad",
                    "Todo en un solo lugar",
                  ],
                },
                {
                  img: "/vacacional.png",
                  info: "Organización total",
                  subInfo:
                    "Ten información clara, ordenada y accesible para una mejor toma de decisiones.",
                  pills: [
                    "Datos centralizados",
                    "Mayor claridad",
                    "Información organizada",
                    "Control eficiente",
                    "Seguimiento en tiempo real",
                  ],
                },
              ].map((slide, i) => {
                return (
                  <SwiperSlide
                    key={i}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} de 4`}
                  >
                    <div
                      className="
                      relative
                      w-full
                      min-h-[520px]
                      sm:min-h-[560px]
                      md:h-[620px]
                      xl:h-[640px]
                      2xl:h-[680px]
                      max-h-[720px]
                      rounded-[24px]
                      md:rounded-[32px]
                      overflow-hidden
                      border
                      border-white/10
                      shadow-[0_25px_90px_rgba(0,0,0,.55)]
                    "
                    >
                      {/* IMAGE */}
                      <Image
                        fill
                        priority
                        src={slide.img}
                        alt={slide.info}
                        className="
                      object-cover
                      md:object-center
                      brightness-[0.68]
                      contrast-125
                    "
                      />

                      {/* MAIN OVERLAY */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/95 via-[#020617]/80 to-[#020617]/40 md:to-[#020617]/30" />

                      {/* CYAN LIGHT */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(6,182,212,.18),transparent_40%)]" />

                      {/* RIGHT DOTS */}
                      <div className="hidden xl:block absolute right-16 top-1/2 -translate-y-1/2 opacity-40">
                        <div className="grid grid-cols-5 gap-4">
                          {Array.from({ length: 25 }).map((_, idx) => (
                            <div
                              key={idx}
                              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                            />
                          ))}
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div
                        className="
                  relative
                  z-10
                  h-full
                  w-full
                  flex
                  items-center
                  px-4
                  sm:px-6
                  md:px-16
                  py-8
                  md:py-12
                "
                      >
                        <div className="w-full max-w-[620px]">
                          {/* BADGE */}
                          <Reveal delay={0.1}>
                            <div
                              className="
                      inline-flex
                      items-center
                      gap-2
                      sm:gap-3
                      px-4
                      sm:px-5
                      py-2
                      sm:py-3
                      rounded-full
                      bg-white/10
                      border
                      border-white/10
                      backdrop-blur-xl
                      mb-5
                      sm:mb-8
                    "
                            >
                              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />

                              <div className="flex flex-row gap-2 sm:gap-3 leading-none">
                                <span className="text-white text-xs sm:text-sm font-semibold">
                                  SmartPH
                                </span>

                                <span className="text-cyan-300 text-[10px] sm:text-[11px] font-medium mt-1">
                                  Gestión inteligente
                                </span>
                              </div>
                            </div>
                          </Reveal>

                          {/* TITLE */}
                          <Title
                            as="h1"
                            size="sm"
                            font="bold"
                            colVariant="on"
                            className="
                      text-[2rem]
                      leading-[2.2rem]
                      sm:text-[3rem]
                      sm:leading-[3.2rem]
                      md:text-[4rem]
                      md:leading-[4.2rem]
                    "
                          >
                            {t(slide.info)}
                          </Title>

                          {/* DESCRIPTION */}
                          <Text
                            size="sm"
                            colVariant="on"
                            tKey={slide.subInfo}
                            translate="yes"
                            className="
                      mt-4
                      text-sm
                      sm:text-base
                      leading-relaxed
                      text-white/85
                      max-w-[95%]
                      sm:max-w-[100%]
                    "
                          />

                          {/* PILLS */}
                          <Reveal delay={0.4}>
                            <div className="hidden md:!flex flex-wrap gap-3 mt-4 sm:mt-10">
                              {slide.pills.map((pill, j) => (
                                <div
                                  key={j}
                                  className={`
                              ${j >= 3 ? "hidden sm:flex" : "flex"}
                              px-4
                              sm:px-5
                              py-2.5
                              sm:py-3
                              rounded-full
                              bg-white/10
                              backdrop-blur-xl
                              text-white/90
                              text-xs
                              sm:text-sm
                              font-medium
                              border
                              border-white/10
                              hover:bg-white/15
                              transition-all
                            `}
                                >
                                  {pill}
                                </div>
                              ))}
                            </div>
                          </Reveal>

                          {/* BUTTON */}
                          <Reveal delay={0.5}>
                            <div className="mt-6 sm:mt-10 w-full sm:max-w-[320px]">
                              <Button
                                className="
                            hidden
                            md:!flex
                            gap-2
                            items-center
                            justify-center
                            transition-all
                            hover:scale-105
                            w-full
                            h-[52px]
                            sm:h-[60px]
                            text-sm
                            sm:text-base
                            font-semibold
                            shadow-[0_0_40px_rgba(34,197,94,.35)]
                          "
                                colVariant="success"
                                rounded="sm"
                                size="lg"
                                aria-label={t("inscripcion")}
                              >
                                {t("inscripcion")}

                                {isPendingAll && (
                                  <ImSpinner9 className="animate-spin text-base" />
                                )}
                              </Button>
                            </div>
                          </Reveal>
                        </div>
                      </div>

                      {/* FLOATING CARD */}
                      <div
                        className="
                  flex
                  absolute
                  bottom-4
                  sm:bottom-8
                  left-1/2
                  -translate-x-1/2
                  xl:left-auto
                  xl:right-8
                  xl:translate-x-0
                  z-20
                  w-[calc(100%-2rem)]
                  sm:w-[340px]
                  xl:w-[360px]
                  rounded-3xl
                  border
                  border-white/10
                  bg-black/30
                  backdrop-blur-2xl
                  p-4
                  sm:p-6
                  shadow-[0_20px_60px_rgba(0,0,0,.45)]
                "
                      >
                        <div className="flex gap-5 items-start">
                          <div
                            className="
                      w-16
                      h-16
                      rounded-2xl
                      bg-cyan-500/10
                      border
                      border-cyan-400/20
                      flex
                      items-center
                      justify-center
                      text-cyan-300
                      text-2xl
                    "
                          >
                            ✓
                          </div>

                          <div>
                            <h3 className="text-white text-xl font-semibold">
                              Todo en un solo lugar
                            </h3>
                            <Button
                              colVariant="success"
                              onClick={() => router.push(route.demost)}
                              rounded="lg"
                            >
                              Solicitar demostración
                            </Button>
                            <Text className="text-white/65 text-sm mt-3 leading-relaxed">
                              Plataforma 100% digital, segura y con total
                              validez legal.
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section
          className="
        relative
        overflow-hidden
        px-2
        md:px-4
        xl:px-6
        py-2
      "
        >
          {/* BACKGROUND LIGHT */}
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />

          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />

          {/* GRID */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
        linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)
      `,
              backgroundSize: "40px 40px",
            }}
          />

          <div
            className="
      relative
      z-10
      max-w-7xl
      mx-auto
      grid
      md:grid-cols-2
      gap-16
      items-center
    "
          >
            {/* LEFT */}
            <div>
              {/* BADGE */}
              <Reveal delay={0.1}>
                <div
                  className="
          inline-flex
          items-center
          gap-3
          px-5
          py-3
          rounded-full
          bg-white/5
          border
          border-white/10
          backdrop-blur-xl
          mb-8
        "
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />

                  <span className=" text-sm font-medium">
                    Plataforma inteligente
                  </span>
                </div>
              </Reveal>

              {/* TITLE */}
              <Reveal delay={0.2}>
                {" "}
                <Reveal delay={0.2}>
                  <Title
                    tKey={t("enAyuda")}
                    as="h2"
                    size="sm"
                    font="bold"
                    className="
              text-5xl
              md:text-6xl
              leading-[1]
              tracking-[-0.04em]
              max-w-[620px]
            "
                  >
                    ¿En qué ayuda SmartPH?
                  </Title>
                </Reveal>
              </Reveal>

              {/* DESCRIPTION */}
              <Reveal delay={0.3}>
                {" "}
                <Text
                  tKey={t("ayudaMessage")}
                  size="md"
                  className="
              mt-8
              leading-relaxed
              text-lg
              md:text-xl
              max-w-[620px]
            "
                >
                  SmartPH apoya a los conjuntos residenciales en la
                  modernización de su gestión, la mejora de la comunicación y la
                  generación de valor económico, respetando siempre su
                  reglamento interno y su autonomía administrativa.
                </Text>
              </Reveal>

              {/* FEATURES */}
              <div className="mt-10 grid gap-4">
                {[
                  "Gestión centralizada",
                  "Comunicación en tiempo real",
                  "Control financiero inteligente",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="
              flex
              items-center
              gap-4
             
            "
                  >
                    <div
                      className="
                w-10
                h-10
                rounded-xl
                bg-cyan-500/10
                border
                border-cyan-400/20
                flex
                items-center
                justify-center
                text-cyan-300
                text-lg
              "
                    >
                      ✓
                    </div>

                    <span className="text-base md:text-lg font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* BUTTON */}
              <div className="mt-12 max-w-[280px]">
                <Button
                  className="
            flex
            gap-2
            items-center
            justify-center
            transition-all
            hover:scale-105
            shadow-[0_0_40px_rgba(34,197,94,.35)]
            w-full
            h-[58px]
            text-base
            font-semibold
          "
                  colVariant="success"
                  rounded="lg"
                  size="lg"
                  onClick={handleClick}
                  aria-label={t("inscripcion")}
                >
                  {t("inscripcion")}

                  {isPendingAll && (
                    <ImSpinner9 className="animate-spin text-base" />
                  )}
                </Button>
              </div>
            </div>

            {/* RIGHT */}
            <div className="relative flex justify-center">
              {/* GLOW */}
              <div
                className="
          absolute
          inset-0
          bg-cyan-500/10
          blur-[120px]
          rounded-full
        "
              />

              {/* IMAGE CARD */}
              <Reveal delay={0.5}>
                {" "}
                <div
                  className="
          relative
          rounded-[32px]
          border
          border-white/10
          bg-white/5
          backdrop-blur-xl
          p-4
          shadow-[0_20px_80px_rgba(0,0,0,.45)]
        "
                >
                  <Image
                    src="/pcmibile.png"
                    alt="SmartPH en computador y celular"
                    width={720}
                    height={620}
                    priority
                    className="
            w-full
            max-w-[620px]
            h-auto
            rounded-md
            object-contain
            drop-shadow-[0_20px_50px_rgba(0,0,0,.45)]
          "
                  />

                  {/* FLOAT CARD */}
                  <div
                    className="
            absolute
            -bottom-6
            -left-6
            hidden
            md:flex
            items-center
            gap-4
            rounded-2xl
            border
            border-white/10
            bg-black/40
            backdrop-blur-2xl
            px-5
            py-4
            shadow-[0_20px_50px_rgba(0,0,0,.45)]
          "
                  >
                    <div
                      className="
              w-12
              h-12
              rounded-xl
              bg-green-500/10
              border
              border-green-400/20
              flex
              items-center
              justify-center
              text-green-300
              text-xl
            "
                    >
                      ↗
                    </div>

                    <div>
                      <Text colVariant="on" size="sm" font="semi">
                        Gestión moderna
                      </Text>

                      <Text size="xs" className="mt-1">
                        Todo desde una sola plataforma
                      </Text>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </Reveal>

      {filteredData?.length > 0 && (
        <Reveal>
          <section
            className="
          relative
          overflow-hidden
          rounded-3xl
          border border-white/10
          px-4
          md:px-8
          py-10
          shadow-[0_0_80px_rgba(0,255,255,0.05)]
        "
            aria-labelledby="featured-immovables"
          >
            {/* Glow effects */}
            <div className="absolute -top-24 left-0 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 blur-3xl rounded-full" />

            {/* Header */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <span
                  className="
          inline-flex
          items-center
          gap-2
          rounded-full
          border border-cyan-400/20
          bg-cyan-400/10
          px-4
          py-1
          text-xs
          font-medium
          tracking-wide
          text-cyan-800
          backdrop-blur-md
        "
                >
                  ✨ Propiedades Premium
                </span>

                <Title
                  id="featured-immovables"
                  tKey={t("inmueblesdestacados")}
                  size="sm"
                  as="h2"
                  font="bold"
                  className="mt-2"
                >
                  Inmuebles destacados
                </Title>

                <Text className="mt-3 max-w-2xl text-sm md:text-base text-gray-400">
                  Descubre propiedades seleccionadas con excelente ubicación,
                  diseño moderno y características exclusivas.
                </Text>
              </div>

              <Button size="sm" colVariant="success" rounded="md">
                ver todos
              </Button>
            </div>

            {/* Cards */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredData.slice(0, 3).map((e) => {
                const infodata = e.files.map((file) =>
                  typeof file === "string" ? file : file,
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
                  <div
                    key={e.id}
                    className="
                  rounded-3xl
                  border
                  border-white/10
                  p-[1px]
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  hover:border-cyan-400/30
                  hover:shadow-[0_0_40px_rgba(0,255,255,0.08)]
                "
                  >
                    <div className="rounded-3xl bg-[#0A0F1F]">
                      <Cardinfoinmueble
                        amenities={e.amenities}
                        amenitiesResident={e.amenitiesResident}
                        codigo={e.codigo}
                        videos={e.videos}
                        videosUrl={e.videoUrl}
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
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </Reveal>
      )}
      <Reveal delay={0.1} direction="up">
        <section
          className="
    relative
    overflow-hidden
    py-16
    sm:py-20
    lg:py-28
    xl:py-32
    bg-cover
    bg-center
    text-white
  "
          style={{
            backgroundImage: "url('/imageultra.jpg')",
          }}
          aria-label="Ecosistema inteligente SmartPH"
        >
          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-[#020617]/90" />

          {/* CYAN GLOW */}
          <div className="absolute top-0 left-0 w-[280px] sm:w-[400px] lg:w-[500px] h-[280px] sm:h-[400px] lg:h-[500px] bg-cyan-500/10 blur-[100px] lg:blur-[140px] rounded-full" />

          {/* BLUE GLOW */}
          <div className="absolute bottom-0 right-0 w-[280px] sm:w-[400px] lg:w-[500px] h-[280px] sm:h-[400px] lg:h-[500px] bg-blue-500/10 blur-[100px] lg:blur-[140px] rounded-full" />

          {/* GRID */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
        linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)
      `,
              backgroundSize: "40px 40px",
            }}
          />

          <div
            className="
      relative
      z-10
      max-w-7xl
      mx-auto
      px-4
      sm:px-6
      lg:px-8
      grid
      grid-cols-1
      lg:grid-cols-2
      gap-12
      lg:gap-16
      items-center
    "
          >
            {/* LEFT CONTENT */}
            <Reveal delay={0.2} direction="left">
              <div className="text-center lg:text-left order-2 lg:order-1">
                {/* BADGE */}
                <Reveal delay={0.25} direction="up">
                  <div
                    className="
              inline-flex
              items-center
              gap-2
              sm:gap-3
              px-4
              sm:px-5
              py-2.5
              sm:py-3
              rounded-full
              bg-white/5
              border
              border-white/10
              backdrop-blur-xl
              mb-6
              sm:mb-8
            "
                  >
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-400 animate-pulse" />

                    <span className="text-xs sm:text-sm text-white/85 font-medium">
                      Ecosistema IA multiagente integrado
                    </span>
                  </div>
                </Reveal>

                {/* TITLE */}
                <Reveal delay={0.3} direction="up">
                  <div className="space-y-2 sm:space-y-3">
                    <Title
                      as="h2"
                      size="sm"
                      font="bold"
                      className="
                text-3xl
                sm:text-4xl
                lg:text-5xl
                leading-tight
              "
                    >
                      SmartPH incorpora agentes inteligentes
                    </Title>

                    <Title
                      className="
                text-cyan-300
                text-3xl
                sm:text-4xl
                lg:text-5xl
                leading-tight
              "
                      size="sm"
                      font="bold"
                    >
                      para administradores, propietarios y residentes
                    </Title>
                  </div>
                </Reveal>

                {/* DESCRIPTION */}
                <Reveal delay={0.4} direction="up">
                  <Text
                    size="sm"
                    colVariant="on"
                    className="
              mt-6
              text-sm
              sm:text-base
              lg:text-lg
              leading-relaxed
              max-w-2xl
              mx-auto
              lg:mx-0
            "
                  >
                    SmartPH integra agentes inteligentes especializados capaces
                    de consultar información, automatizar procesos, responder
                    solicitudes y ejecutar acciones operativas mediante lenguaje
                    natural y conexión en tiempo real con el conjunto
                    residencial.
                  </Text>
                </Reveal>

                {/* SUBTEXT */}
                <Reveal delay={0.5} direction="up">
                  <Text
                    size="sm"
                    className="
              text-white/55
              max-w-xl
              mx-auto
              lg:mx-0
              mt-5
              text-sm
              sm:text-base
              leading-relaxed
            "
                  >
                    Cada usuario cuenta con una experiencia IA personalizada:
                    administradores automatizan procesos, propietarios consultan
                    pagos y documentos, y residentes reciben soporte inmediato
                    desde una sola plataforma inteligente.
                  </Text>
                </Reveal>

                {/* FEATURE LIST */}
                <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-5">
                  {[
                    "Administradores automatizan tareas y procesos",
                    "Propietarios consultan pagos y documentos al instante",
                    "Residentes reciben asistencia inteligente en tiempo real",
                    "Automatiza recordatorios y tareas recurrentes",
                    "Gestiona mantenimientos, proveedores y reportes",
                    "IA conectada directamente con el conjunto residencial",
                  ].map((item, i) => (
                    <Reveal key={i} delay={0.6 + i * 0.08} direction="left">
                      <div
                        className="
                  flex
                  items-start
                  sm:items-center
                  gap-3
                  sm:gap-4
                  justify-center
                  lg:justify-start
                  text-left
                "
                      >
                        <div
                          className="
                    min-w-[42px]
                    w-10
                    h-10
                    sm:w-11
                    sm:h-11
                    rounded-xl
                    bg-cyan-500/10
                    border
                    border-cyan-400/20
                    flex
                    items-center
                    justify-center
                    text-cyan-300
                    text-base
                    sm:text-lg
                  "
                        >
                          ✓
                        </div>

                        <span className="text-white/90 text-sm sm:text-base lg:text-lg font-medium leading-relaxed">
                          {item}
                        </span>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* RIGHT SIDE */}
            <Reveal delay={0.3} direction="right">
              <div className="relative order-1 lg:order-2">
                {/* FLOATING STATUS */}
                <Reveal delay={0.4} direction="down">
                  <div
                    className="
              hidden
              sm:flex
              absolute
              -top-5
              left-1/2
              lg:left-0
              -translate-x-1/2
              lg:-translate-x-0
              z-30
              rounded-2xl
              border
              border-white/10
              bg-black/40
              backdrop-blur-2xl
              px-4
              py-3
              items-center
              gap-3
              shadow-[0_20px_50px_rgba(0,0,0,.45)]
            "
                  >
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

                    <div>
                      <Text colVariant="on" size="sm" font="semi">
                        Agentes IA activos
                      </Text>

                      <Text className="text-white/60 text-xs mt-1">
                        Automatización y asistencia en tiempo real
                      </Text>
                    </div>
                  </div>
                </Reveal>

                {/* MAIN CARD */}
                <div
                  className="
            relative
            rounded-[28px]
            sm:rounded-[32px]
            border
            border-white/10
            bg-white/5
            backdrop-blur-2xl
            pt-6
            sm:pt-8
            lg:pt-24
            px-4
            sm:px-6
            pb-4
            sm:pb-6
            shadow-[0_25px_80px_rgba(0,0,0,.55)]
          "
                >
                  {/* FLOATING IMAGE */}
                  <Reveal delay={0.6} direction="down">
                    <div
                      className="
                relative
                mx-auto
                mb-2
                w-fit
                lg:absolute
                lg:-top-28
                lg:right-8
                lg:mb-0
                z-20
              "
                    >
                      <div
                        className="
                  relative
                  rounded-3xl
                  border
                  border-white/10
                  bg-black/30
                  backdrop-blur-2xl
                  p-2.5
                  sm:p-3
                  shadow-[0_25px_60px_rgba(0,0,0,.45)]
                "
                      >
                        <Image
                          src="/gcmplx.png"
                          alt="IA SmartPH"
                          width={140}
                          height={140}
                          className="
                    rounded-2xl
                    object-cover
                    w-[160px]
                    h-[160px]
                    sm:w-[220px]
                    sm:h-[220px]
                  "
                        />

                        <div
                          className="
                    absolute
                    inset-0
                    rounded-3xl
                    bg-cyan-500/10
                    blur-2xl
                    -z-10
                  "
                        />
                      </div>
                    </div>
                  </Reveal>

                  {/* ADMIN CHAT */}
                  <Reveal delay={0.7} direction="up">
                    <div
                      className="
                rounded-3xl
                border
                border-white/10
                bg-black/30
                backdrop-blur-xl
                p-4
                sm:p-6
              "
                    >
                      <div className="flex items-start sm:items-center gap-4 mb-5 sm:mb-6">
                        <div
                          className="
                    min-w-[52px]
                    w-12
                    h-12
                    sm:w-14
                    sm:h-14
                    rounded-2xl
                    bg-cyan-500/10
                    border
                    border-cyan-400/20
                    flex
                    items-center
                    justify-center
                    text-cyan-300
                    text-xl
                    sm:text-2xl
                  "
                        >
                          ✦
                        </div>

                        <div>
                          <Title
                            as="h3"
                            className="text-xl sm:text-2xl font-bold"
                          >
                            IA Administrativa
                          </Title>

                          <Text className="text-white/70 mt-1 text-sm sm:text-base">
                            Automatiza procesos y tareas operativas
                          </Text>
                        </div>
                      </div>

                      <div className="mt-6 sm:mt-8 space-y-4">
                        <div
                          className="
                    ml-auto
                    max-w-[90%]
                    sm:max-w-[85%]
                    rounded-2xl
                    rounded-br-md
                    bg-cyan-500
                    px-4
                    py-3
                    text-xs
                    sm:text-sm
                    text-white
                  "
                        >
                          Recuérdame revisar la piscina todos los martes
                        </div>

                        <div
                          className="
                    max-w-[95%]
                    sm:max-w-[90%]
                    rounded-2xl
                    rounded-bl-md
                    bg-white/10
                    border
                    border-white/10
                    px-4
                    py-3
                    text-xs
                    sm:text-sm
                    text-white/85
                  "
                        >
                          ✅ Recordatorio recurrente creado para todos los
                          martes a las 5:00 PM.
                        </div>
                      </div>
                    </div>
                  </Reveal>

                  {/* OWNER CHAT */}
                  <Reveal delay={0.85} direction="up">
                    <div
                      className="
                mt-5
                sm:mt-6
                rounded-3xl
                border
                border-white/10
                bg-black/30
                backdrop-blur-xl
                p-4
                sm:p-6
              "
                    >
                      <div className="flex items-start sm:items-center gap-4 mb-5">
                        <div
                          className="
                    min-w-[52px]
                    w-12
                    h-12
                    sm:w-14
                    sm:h-14
                    rounded-2xl
                    bg-green-500/10
                    border
                    border-green-400/20
                    flex
                    items-center
                    justify-center
                    text-green-300
                    text-xl
                    sm:text-2xl
                  "
                        >
                          ⌂
                        </div>

                        <div>
                          <Title
                            as="h3"
                            className="text-xl sm:text-2xl font-bold"
                          >
                            IA del Propietario
                          </Title>

                          <Text className="text-white/70 mt-1 text-sm sm:text-base">
                            Información y asistencia personalizada
                          </Text>
                        </div>
                      </div>

                      <div className="mt-6 sm:mt-8 space-y-4">
                        <div
                          className="
                    ml-auto
                    max-w-[90%]
                    sm:max-w-[85%]
                    rounded-2xl
                    rounded-br-md
                    bg-green-500
                    px-4
                    py-3
                    text-xs
                    sm:text-sm
                    text-white
                  "
                        >
                          ¿Cuánto debo este mes y cuándo vence mi pago?
                        </div>

                        <div
                          className="
                    max-w-[95%]
                    sm:max-w-[90%]
                    rounded-2xl
                    rounded-bl-md
                    bg-white/10
                    border
                    border-white/10
                    px-4
                    py-3
                    text-xs
                    sm:text-sm
                    text-white/85
                  "
                        >
                          📄 Tu saldo pendiente es de $320.000 y vence el 28 de
                          mayo. También puedo solicitar tu certificado de paz y
                          salvo.
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </Reveal>

      <Reveal>
        {" "}
        <section
          className="
    relative
    overflow-hidden
    py-10
    px-4
  "
          aria-labelledby="benefits-title"
        >
          {/* GLOW */}
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />

          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />

          {/* GRID */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
        linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)
      `,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="text-center mb-16">
              <div
                className="
          inline-flex
          items-center
          gap-3
          px-5
          py-3
          rounded-full
          bg-white/5
          border
          border-white/10
          backdrop-blur-xl
          mb-8
        "
              >
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />

                <span className=" text-sm font-medium">
                  Beneficios exclusivos
                </span>
              </div>

              <Title as="h2" colVariant="default" font="bold">
                Beneficios por pertenecer a SmartPH
              </Title>

              <Text
                className="
          text-lg
          md:text-xl
          mt-6
          max-w-3xl
          mx-auto
          leading-relaxed
        "
              >
                SmartPH conecta tecnología, comunidad y beneficios exclusivos
                para transformar la administración residencial.
              </Text>
            </div>

            {/* SLIDER */}
            <Swiper
              slidesPerView={1}
              spaceBetween={24}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
              }}
              loop
              breakpoints={{
                640: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: 2,
                },
                1200: {
                  slidesPerView: 3,
                },
              }}
              modules={[Autoplay]}
              className="
    pb-6
    rounded-[40px]
  "
            >
              {[
                {
                  icon: "📈",
                  title: "Mayor valorización",
                  text: "Digitalizar la administración mejora la percepción, organización y valorización del conjunto residencial.",
                },
                {
                  icon: "⚡",
                  title: "Procesos más rápidos",
                  text: "Reduce tiempos administrativos y automatiza tareas repetitivas desde una sola plataforma.",
                },
                {
                  icon: "🤝",
                  title: "Comunidad conectada",
                  text: "Mejora la comunicación entre residentes, administración y consejo de forma centralizada.",
                },
                {
                  icon: "🔒",
                  title: "Más seguridad",
                  text: "Centraliza información y accesos para tener un mayor control y seguimiento en tiempo real.",
                },
                {
                  icon: "💰",
                  title: "Ahorro económico",
                  text: "Disminuye gastos operativos y reduce el uso de papel, llamadas y procesos manuales.",
                },
                {
                  icon: "📲",
                  title: "Acceso desde cualquier lugar",
                  text: "Los residentes y administradores pueden gestionar todo fácilmente desde el celular o computador.",
                },
                {
                  icon: "🕒",
                  title: "Menos tiempo perdido",
                  text: "Optimiza solicitudes, pagos y comunicaciones para evitar filas, llamadas y retrasos.",
                },
                {
                  icon: "🌱",
                  title: "Conjuntos más sostenibles",
                  text: "Reduce el consumo de papel y fomenta procesos digitales más amigables con el medio ambiente.",
                },
                {
                  icon: "📊",
                  title: "Mayor control administrativo",
                  text: "Permite llevar seguimiento claro de pagos, reservas, documentos y procesos importantes.",
                },
                {
                  icon: "😊",
                  title: "Mejor experiencia para residentes",
                  text: "Facilita la vida diaria con herramientas rápidas, organizadas y fáciles de usar.",
                },
              ].map((b, i) => (
                <SwiperSlide key={i}>
                  <div
                    role="listitem"
                    className="
          relative
          h-full
          min-h-[320px]
          rounded-[32px]
          border
          border-white/5
          bg-[#0B1120]
          backdrop-blur-2xl
          p-8
          overflow-hidden
          transition-all
          duration-300
          hover:-translate-y-2
          hover:border-cyan-400/20
          hover:shadow-[0_25px_60px_rgba(6,182,212,.15)]
        "
                  >
                    {/* CARD GLOW */}
                    <div
                      className="
            absolute
            top-0
            right-0
            w-32
            h-32
            bg-cyan-500/10
            blur-3xl
            rounded-full
          "
                    />

                    {/* ICON */}
                    <div
                      className="
            relative
            z-10
            w-20
            h-20
            rounded-3xl
            bg-cyan-500/10
            border
            border-cyan-400/20
            flex
            items-center
            justify-center
            text-4xl
            mb-8
          "
                      aria-hidden="true"
                    >
                      {b.icon}
                    </div>

                    {/* TITLE */}
                    <Title
                      size="xs"
                      font="bold"
                      className="
            text-white
            text-2xl
            leading-tight
            tracking-[-0.03em]
          "
                    >
                      {b.title}
                    </Title>

                    {/* TEXT */}
                    <Text
                      size="xs"
                      className="
            mt-5
            text-white/70
            text-base
            leading-relaxed
          "
                    >
                      {b.text}
                    </Text>

                    {/* FLOATING NUMBER */}
                    <div
                      className="
            absolute
            bottom-6
            right-6
            text-white/10
            text-6xl
            font-black
          "
                    >
                      0{i + 1}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      </Reveal>

      <Reveal>
        {" "}
        <FooterComplex />
      </Reveal>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="
    fixed
    bottom-6
    right-6
    z-50
    flex
    items-center
    gap-3
    bg-green-500
    hover:bg-green-600
    text-white
    px-4
    py-3
    rounded-full
    shadow-lg
    transition-all
    hover:scale-105
    active:scale-95
  "
      >
        {/* ICONO + PULSO */}
        <div className="relative flex items-center justify-center">
          <FaWhatsapp size={22} />

          {/* punto online */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        </div>

        {/* TEXTO */}
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-sm sm:text-base">
            Agenda tu demo
          </span>

          <span className="text-[11px] sm:text-xs opacity-90">
            Hablar con un asesor
          </span>
        </div>
      </a>
    </div>
  );
}
