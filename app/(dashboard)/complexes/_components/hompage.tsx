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

  return (
    <div key={language}>
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

        <div className="relative z-10 w-full max-w-[1600px] mx-auto">
          <Swiper
            spaceBetween={10}
            pagination={{ clickable: true }}
            navigation
            autoplay={{
              delay: 8000,
              disableOnInteraction: false,
            }}
            loop
            modules={[Pagination, Autoplay, A11y, Navigation]}
            className="mySwiper rounded-[32px] overflow-hidden"
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
            ].map((slide, i) => (
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
              h-[560px]
              md:h-[680px]
              rounded-[32px]
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
                scale-105
                brightness-[0.68]
                contrast-125
              "
                  />

                  {/* MAIN OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/95 via-[#020617]/75 to-[#020617]/30" />

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

                  <div
                    className="
                    absolute
                    top-6
                    right-6
                    z-20
                    hidden
                    lg:flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    rounded-2xl
                    bg-black/30
                    backdrop-blur-xl
                    border
                    border-white/10
                    shadow-[0_10px_40px_rgba(0,0,0,.35)]
                  "
                  >
                    <img
                      src="/complex.jpg"
                      alt="SmartPH"
                      className="
                      w-[140px]
                      h-[140px]
                      min-w-[140px]
                      max-w-[140px]
                      object-contain
                      rounded-xl
                    "
                    />

                    <Button
                      colVariant="success"
                      // onClick={() => router.push(route.demost)}
                      rounded="lg"
                    >
                      Solicitar demostración
                    </Button>
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
                px-6
                md:px-16
                py-12
              "
                  >
                    <div className="max-w-[620px]">
                      {/* BADGE */}
                      <div
                        className="
                    inline-flex
                    items-center
                    gap-3
                    px-5
                    py-3
                    rounded-full
                    bg-white/10
                    border
                    border-white/10
                    backdrop-blur-xl
                    mb-8
                  "
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />

                        <div className="flex flex-row gap-3 leading-none">
                          <span className="text-white text-sm font-semibold">
                            SmartPH
                          </span>

                          <span className="text-cyan-300 text-[11px] font-medium mt-1">
                            Gestión inteligente
                          </span>
                        </div>
                      </div>

                      {/* TITLE */}
                      <Title as="h1" size="md" font="bold" colVariant="on">
                        {t(slide.info)}
                      </Title>

                      {/* DESCRIPTION */}
                      <Text
                        size="md"
                        colVariant="on"
                        tKey={slide.subInfo}
                        translate="yes"
                      />

                      {/* PILLS */}
                      <div className="flex flex-wrap gap-4 mt-10">
                        {slide.pills.map((pill, j) => (
                          <div
                            key={j}
                            className="
                        px-5
                        py-3
                        rounded-full
                        bg-white/10
                        backdrop-blur-xl
                        text-white/90
                        text-sm
                        font-medium
                        border
                        border-white/10
                        hover:bg-white/15
                        transition-all
                      "
                          >
                            {pill}
                          </div>
                        ))}
                      </div>

                      {/* BUTTON */}
                      <div className="mt-10 max-w-[320px]">
                        <Button
                          className="
                      flex
                      gap-2
                      items-center
                      justify-center
                      transition-all
                      hover:scale-105
                      w-full
                      h-[60px]
                      text-base
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
                    </div>
                  </div>

                  {/* FLOATING CARD */}
                  <div
                    className="
                hidden
                xl:flex
                absolute
                bottom-8
                right-8
                z-20
                w-[360px]
                rounded-3xl
                border
                border-white/10
                bg-black/30
                backdrop-blur-2xl
                p-6
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
                          Vota desde cualquier lugar
                        </h3>

                        <p className="text-white/65 text-sm mt-3 leading-relaxed">
                          Plataforma 100% digital, segura y con total validez
                          legal.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

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

            {/* TITLE */}
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

            {/* DESCRIPTION */}
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
              SmartPH apoya a los conjuntos residenciales en la modernización de
              su gestión, la mejora de la comunicación y la generación de valor
              económico, respetando siempre su reglamento interno y su autonomía
              administrativa.
            </Text>

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
                width={620}
                height={520}
                priority
                className="
            w-full
            max-w-[620px]
            h-auto
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
                  <p className="text-white text-sm font-semibold">
                    Gestión moderna
                  </p>

                  <p className="text-white/60 text-xs mt-1">
                    Todo desde una sola plataforma
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {filteredData?.length > 0 && (
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

              <p className="mt-3 max-w-2xl text-sm md:text-base text-gray-400">
                Descubre propiedades seleccionadas con excelente ubicación,
                diseño moderno y características exclusivas.
              </p>
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
      )}

      <section
        className="
    relative
    overflow-hidden
    py-24
    md:py-32
    bg-cover
    bg-center
    text-white
  "
        style={{
          backgroundImage: "url('/imageultra.jpg')",
        }}
        aria-label="Administración inteligente"
      >
        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-[#020617]/85" />

        {/* CYAN GLOW */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[140px] rounded-full" />

        {/* BLUE GLOW */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full" />

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
      grid
      lg:grid-cols-2
      gap-16
      items-center
    "
        >
          {/* LEFT CONTENT */}
          <div className="text-center lg:text-left">
            {/* BADGE */}
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

              <span className="text-sm text-white/85 font-medium">
                Asistente inteligente integrado
              </span>
            </div>

            {/* TITLE */}
            <Title as="h2" size="md" font="bold">
              La administración de conjuntos ahora tiene
            </Title>

            {/* HIGHLIGHT */}
            <Title
              className="
                text-cyan-300
              "
              size="md"
              font="bold"
            >
              un asistente inteligente
            </Title>

            {/* DESCRIPTION */}
            <Text size="md" colVariant="on">
              SmartPH integra un asistente digital que permite a los
              administradores consultar información del conjunto de forma rápida
              mediante chat. Accede a datos de residentes, pagos, certificados,
              mantenimiento y más sin tener que buscar manualmente.
            </Text>

            {/* SUBTEXT */}
            <Text
              size="sm"
              className="
          text-white/55
          max-w-xl
          mx-auto
          lg:mx-0
          mt-6
          text-base
          leading-relaxed
        "
            >
              Una forma más rápida e inteligente de gestionar la información del
              conjunto y optimizar el trabajo administrativo.
            </Text>

            {/* FEATURE LIST */}
            <div className="mt-10 grid gap-4">
              {[
                "Consulta pagos y estados de cuenta",
                "Busca residentes y propietarios",
                "Obtén certificados y reportes al instante",
              ].map((item, i) => (
                <div
                  key={i}
                  className="
              flex
              items-center
              gap-4
              justify-center
              lg:justify-start
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

                  <span className="text-white/90 text-base md:text-lg font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          {/* RIGHT SIDE */}
          <div className="relative">
            {/* MAIN CARD */}
            <div
              className="
      relative
      rounded-[32px]
      border
      border-white/10
      bg-white/5
      backdrop-blur-2xl
      pt-28
      px-6
      pb-6
      shadow-[0_25px_80px_rgba(0,0,0,.55)]
    "
            >
              {/* FLOATING IMAGE */}
              <div
                className="
        absolute
        -top-16
        right-10
        z-20
        hidden
        lg:block
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
          p-3
          shadow-[0_25px_60px_rgba(0,0,0,.45)]
        "
                >
                  <Image
                    src="/gcmplx.png"
                    alt="Asistente IA"
                    width={240}
                    height={240}
                    className="
            rounded-2xl
            object-cover
            w-[220px]
            h-[220px]
          "
                  />

                  {/* GLOW */}
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

              {/* CHAT CARD */}
              <div
                className="
        rounded-3xl
        border
        border-white/10
        bg-black/30
        backdrop-blur-xl
        p-6
      "
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="
                      w-14
                      h-14
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
                    ✦
                  </div>

                  <div>
                    <Title as="h3" className="text-2xl font-bold">
                      Asistente
                    </Title>

                    <Text className="text-white/70 mt-1">
                      Consulta información fácilmente
                    </Text>
                  </div>
                </div>

                <Text size="sm" className="text-white/75 leading-relaxed">
                  Pregunta por pagos, residentes, certificados o mantenimiento y
                  obtén respuestas al instante mediante nuestro asistente
                  inteligente.
                </Text>

                {/* CHAT EXAMPLE */}
                <div className="mt-8 space-y-4">
                  <div
                    className="
            ml-auto
            max-w-[85%]
            rounded-2xl
            rounded-br-md
            bg-cyan-500
            px-4
            py-3
            text-sm
            text-white
          "
                  >
                    ¿Qué apartamentos tienen pagos pendientes?
                  </div>

                  <div
                    className="
            max-w-[90%]
            rounded-2xl
            rounded-bl-md
            bg-white/10
            border
            border-white/10
            px-4
            py-3
            text-sm
            text-white/85
          "
                  >
                    Encontré 12 apartamentos con cartera pendiente este mes.
                  </div>
                </div>
              </div>

              {/* SECOND CARD */}
              <div
                className="
        mt-6
        rounded-3xl
        border
        border-white/10
        bg-black/30
        backdrop-blur-xl
        p-6
      "
              >
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="
            w-14
            h-14
            rounded-2xl
            bg-green-500/10
            border
            border-green-400/20
            flex
            items-center
            justify-center
            text-green-300
            text-2xl
          "
                  >
                    ↗
                  </div>

                  <div>
                    <Title as="h3" className="text-2xl font-bold">
                      Gestión Más Rápida
                    </Title>

                    <Text className="text-white/70 mt-1">
                      Menos tiempo buscando
                    </Text>
                  </div>
                </div>

                <Text size="sm" className="text-white/75 leading-relaxed">
                  Accede a la información del conjunto en segundos y agiliza la
                  gestión administrativa desde una sola plataforma inteligente.
                </Text>
              </div>
            </div>

            {/* FLOATING STATUS */}
            <div
              className="
              hidden
              md:flex
              absolute
              -top-6
              -left-6
              rounded-2xl
              border
              border-white/10
              bg-black/40
              backdrop-blur-2xl
              px-5
              py-4
              items-center
              gap-4
              shadow-[0_20px_50px_rgba(0,0,0,.45)]
    "
            >
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

              <div>
                <p className="text-white text-sm font-semibold">IA activa</p>

                <p className="text-white/60 text-xs mt-1">
                  Respuestas en tiempo real
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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

            <Title as="h2" colVariant="on" font="bold">
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
              SmartPH conecta tecnología, comunidad y beneficios exclusivos para
              transformar la administración residencial.
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

      <FooterComplex />
    </div>
  );
}
