/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
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
import Logo3d from "./logo-3d";
import AliadosHome from "./aliados-home";
import SocialProof from "./social-proof";
import TrustSection from "./trust-section";
import { FaStore, FaWhatsapp } from "react-icons/fa";

export default function Homepage() {
  const { isPendingAll, countryOptions, data, filteredData, t, language } =
    HomepageInfo();
  const router = useRouter();
  const advisors = [
    "573003066369",
    "573246829832",
    "573007908880",
    "573044156317",
  ];

  const randomAdvisor = advisors[Math.floor(Math.random() * advisors.length)];

  const whatsappUrl = `https://wa.me/${randomAdvisor}?text=Hola,%20quiero%20una%20demostración%20de%20globaliaph`;

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
          <div
            className="
              relative
              z-10
              w-full
              max-w-[1400px]
              mx-auto
              overflow-hidden
              rounded-[24px]
              md:rounded-[32px]
              border
              border-black/5
              shadow-[0_20px_60px_rgba(0,0,0,.12)]
            "
          >
            <div
              className="
                relative
                w-full
                min-h-[340px]
                sm:min-h-[400px]
                md:min-h-[460px]
              "
            >
              {/* BACKGROUND IMAGE */}
              <Image
                fill
                priority
                src="/aptos.png"
                alt={t("home.hero.alt")}
                className="object-cover"
              />

              {/* LIGHT OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/40" />

              {/* CONTENT */}
              <div
                className="
                  relative
                  z-10
                  h-full
                  w-full
                  flex
                  items-center
                  px-5
                  sm:px-8
                  md:px-14
                  py-8
                  md:py-12
                "
              >
                <div className="w-full flex flex-col md:flex-row items-center gap-8">
                  {/* LEFT: TEXT */}
                  <div className="w-full md:max-w-[620px]">
                    <Reveal delay={0.1}>
                      <Title
                        as="h1"
                        size="sm"
                        font="bold"
                        className="
                          text-[2rem]
                          leading-[2.4rem]
                          sm:text-[2.6rem]
                          sm:leading-[3rem]
                          md:text-[3.4rem]
                          md:leading-[3.8rem]
                          text-slate-800
                        "
                      >
                        <span className="text-blue-800">
                          {t("home.hero.title1")}
                        </span>{" "}
                        {t("home.hero.title2")}{" "}
                        <span className="text-green-600">
                          {t("home.hero.title3")}
                        </span>
                      </Title>
                    </Reveal>

                    <Reveal delay={0.3}>
                      <Text
                        size="md"
                        font="bold"
                        className="
                          mt-4
                          sm:text-base
                          leading-relaxed
                          max-w-[520px]
                        "
                      >
                        {t("home.hero.subtitle")}
                      </Text>
                      <Text size="sm">✅ {t("home.hero.bullet1")}</Text>
                      <Text size="sm">✅ {t("home.hero.bullet2")}</Text>
                      <Text size="sm">✅ {t("home.hero.bullet3")}</Text>
                    </Reveal>

                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 w-full">
                      <Button
                        className="
                            flex
                            gap-2
                            items-center
                            justify-center
                            transition-all
                            hover:scale-105
                            w-full
                            sm:w-auto
                            sm:min-w-[240px]
                            h-[52px]
                            sm:h-[56px]
                            text-sm
                            sm:text-base
                            font-semibold
                            shadow-[0_0_40px_rgba(34,197,94,.35)]
                          "
                        colVariant="success"
                        rounded="md"
                        size="lg"
                        onClick={() => router.push(route.demost)}
                        aria-label="Solicita una demo gratuita"
                      >
                        {t("home.hero.ctaDemo")}
                        {isPendingAll && (
                          <ImSpinner9 className="animate-spin text-base" />
                        )}
                      </Button>

                      {/* <Button
                        className="
                            flex
                            items-center
                            justify-center
                            transition-all
                            hover:scale-105
                            w-full
                            sm:w-auto
                            sm:min-w-[200px]
                            h-[52px]
                            sm:h-[56px]
                            text-sm
                            sm:text-base
                            font-semibold
                          "
                        colVariant="primary"
                        rounded="md"
                        size="lg"
                        onClick={() => router.push(route.planes)}
                        aria-label="Ver planes y precios"
                      >
                        {t("home.hero.ctaPlans")}
                      </Button> */}
                    </div>

                    {/* El conjunto es el cliente principal, pero el comercio
                        también compra: se le da una entrada visible sin
                        competir con los dos botones de arriba. */}
                    <button
                      type="button"
                      onClick={() => router.push(route.comercios)}
                      className="mt-4 inline-flex items-center gap-2 self-start text-sm font-semibold text-cyan-700 underline underline-offset-4 transition-colors hover:text-cyan-900"
                    >
                      <FaStore size={14} />
                      {t("home.hero.ctaComercio")} →
                    </button>
                  </div>

                  {/* RIGHT: LOGO */}
                  <div className="hidden md:flex flex-1 items-center justify-center">
                    <Logo3d />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <SocialProof />

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
                    ¿En qué ayuda globaliaph?
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
                  globaliaph apoya a los conjuntos residenciales en la
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
                    alt="globaliaph en computador y celular"
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

                      <Text
                        size="xs"
                        colVariant="primary"
                        className="mt-1"
                        font="semi"
                      >
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
                  {t("home.immovables.description")}
                </Text>
              </div>

              <Button
                size="sm"
                colVariant="success"
                rounded="md"
                onClick={() => router.push(route.immovables)}
              >
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
      <Reveal>
        <section
          className="
            relative
            overflow-hidden
            px-4
            md:px-8
            py-14
          "
          aria-labelledby="ingresos-title"
        >
          <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-green-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <Reveal delay={0.1}>
                <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
                  <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400" />
                  <span className="text-sm font-medium">
                    {t("home.revenue.badge")}
                  </span>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <Title
                  id="ingresos-title"
                  as="h2"
                  size="sm"
                  font="bold"
                  className="text-4xl leading-[1.05] tracking-[-0.03em] md:text-5xl"
                >
                  {t("home.revenue.title1")}{" "}
                  <span className="text-green-600">
                    {t("home.revenue.title2")}
                  </span>
                  .
                </Title>
              </Reveal>

              <Reveal delay={0.3}>
                <Text size="md" className="mt-6 leading-relaxed">
                  {t("home.revenue.subtitle")}
                </Text>
              </Reveal>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  id: "parking",
                  icon: "🅿️",
                  title: t("home.revenue.parking.title"),
                  text: t("home.revenue.parking.text"),
                },
                {
                  id: "locals",
                  icon: "🏬",
                  title: t("home.revenue.locals.title"),
                  text: t("home.revenue.locals.text"),
                },
                {
                  id: "ads",
                  icon: "📢",
                  title: t("home.revenue.ads.title"),
                  text: t("home.revenue.ads.text"),
                },
                {
                  id: "partners",
                  icon: "🤝",
                  title: t("home.revenue.partners.title"),
                  text: t("home.revenue.partners.text"),
                },
                {
                  id: "stays",
                  icon: "🏖️",
                  title: t("home.revenue.stays.title"),
                  text: t("home.revenue.stays.text"),
                },
                {
                  id: "referrals",
                  icon: "🎁",
                  title: t("home.revenue.referrals.title"),
                  text: t("home.revenue.referrals.text"),
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="
                    rounded-[28px]
                    border
                    border-black/5
                    bg-white/60
                    p-6
                    shadow-[0_20px_60px_rgba(0,0,0,.08)]
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-[0_25px_70px_rgba(0,0,0,.12)]
                  "
                >
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-green-400/20 bg-green-500/10 text-2xl"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>

                  <Text font="bold" size="md">
                    {item.title}
                  </Text>

                  <Text
                    size="sm"
                    className="mt-2 leading-relaxed text-gray-500"
                  >
                    {item.text}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <AliadosHome />

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
          aria-label="Ecosistema inteligente globaliaph"
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
                      globaliaph incorpora agentes inteligentes
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
                    globaliaph integra agentes inteligentes especializados
                    capaces de consultar información, automatizar procesos,
                    responder solicitudes y ejecutar acciones operativas
                    mediante lenguaje natural y conexión en tiempo real con el
                    conjunto residencial.
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
                          alt="IA globaliaph"
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
                  {t("home.modules.badge")}
                </span>
              </div>

              <Title as="h2" colVariant="default" font="bold">
                {t("home.modules.title")}
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
                {t("home.modules.subtitle")}
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
                  icon: "💳",
                  title: t("home.modules.cartera.title"),
                  text: t("home.modules.cartera.text"),
                },
                {
                  icon: "🗳️",
                  title: t("home.modules.asambleas.title"),
                  text: t("home.modules.asambleas.text"),
                },
                {
                  icon: "📅",
                  title: t("home.modules.reservas.title"),
                  text: t("home.modules.reservas.text"),
                },
                {
                  icon: "🛎️",
                  title: t("home.modules.pqr.title"),
                  text: t("home.modules.pqr.text"),
                },
                {
                  icon: "🔐",
                  title: t("home.modules.accesos.title"),
                  text: t("home.modules.accesos.text"),
                },
                {
                  icon: "📹",
                  title: t("home.modules.camaras.title"),
                  text: t("home.modules.camaras.text"),
                },
                {
                  icon: "🛠️",
                  title: t("home.modules.mantenimiento.title"),
                  text: t("home.modules.mantenimiento.text"),
                },
                {
                  icon: "🚨",
                  title: t("home.modules.emergencias.title"),
                  text: t("home.modules.emergencias.text"),
                },
                {
                  icon: "👷",
                  title: t("home.modules.personal.title"),
                  text: t("home.modules.personal.text"),
                },
                {
                  icon: "📁",
                  title: t("home.modules.documentos.title"),
                  text: t("home.modules.documentos.text"),
                },
                {
                  icon: "🅿️",
                  title: t("home.modules.parqueaderos.title"),
                  text: t("home.modules.parqueaderos.text"),
                },
                {
                  icon: "🤖",
                  title: t("home.modules.ia.title"),
                  text: t("home.modules.ia.text"),
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
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      </Reveal>

      <TrustSection />

      <Reveal>
        <section
          className="relative overflow-hidden px-4 py-16 md:px-8"
          aria-labelledby="cierre-title"
        >
          <div className="relative z-10 mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0B1120] px-6 py-12 text-center shadow-[0_25px_80px_rgba(0,0,0,.35)] md:px-12 md:py-16">
            <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />

            <div className="relative z-10">
              <Title
                id="cierre-title"
                as="h2"
                size="sm"
                font="bold"
                className="text-3xl leading-tight text-white md:text-4xl"
              >
                {t("home.closing.title")}
              </Title>

              <Text size="md" className="mx-auto mt-5 max-w-2xl text-white/70">
                {t("home.closing.text")}
              </Text>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  className="h-[52px] w-full font-semibold transition-all hover:scale-105 sm:w-auto sm:min-w-[240px]"
                  colVariant="success"
                  rounded="md"
                  size="lg"
                  onClick={() => router.push(route.demost)}
                >
                  {t("home.closing.ctaDemo")}
                </Button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[52px] w-full items-center justify-center gap-2 rounded-md border border-white/20 px-6 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-white/5 sm:w-auto sm:min-w-[240px]"
                >
                  <FaWhatsapp size={18} />
                  {t("home.closing.ctaWhatsapp")}
                </a>
              </div>

              <Text size="xs" className="mt-6 text-white/50">
                {t("home.closing.note")}
              </Text>

              {/* Segundo carril: el cierre hablaba solo al conjunto y un
                  comercio que llegaba hasta aquí se quedaba sin qué hacer. */}
              <div className="mt-10 rounded-[24px] border border-white/10 bg-white/5 p-5 text-left sm:flex sm:items-center sm:justify-between sm:gap-6">
                <div>
                  <Text size="sm" font="bold" className="text-white">
                    {t("home.closing.comercioTitle")}
                  </Text>
                  <Text size="xs" className="mt-1 text-white/60">
                    {t("home.closing.comercioText")}
                  </Text>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(route.comercios)}
                  className="mt-4 flex h-[44px] w-full shrink-0 items-center justify-center gap-2 rounded-md bg-cyan-600 px-5 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-cyan-500 sm:mt-0 sm:w-auto"
                >
                  <FaStore size={14} />
                  {t("home.closing.comercioCta")}
                </button>
              </div>
            </div>
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
