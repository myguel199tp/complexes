"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination, Autoplay, A11y } from "swiper/modules";
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
    handleClick,
    handleClickFundation,
    t,
    language,
  } = HomepageInfo();

  return (
    <div key={language}>
      {/* HERO */}
      <section className="flex flex-col md:flex-row gap-4 justify-center items-center min-h-max bg-gradient-to-r from-blue-50 via-white to-blue-50 px-2">
        {/* Slider accesible */}
        <div className="w-full">
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
              { img: "/apartamento.jpeg", key: "mensajeInfo" },
              { img: "/family.jpg", key: "mensajeInfo" },
              { img: "/montaña.jpeg", key: "mensajeInfo" },
              { img: "/playa.jpeg", key: "mensajeInfo" },
            ].map((slide, i) => (
              <SwiperSlide
                key={i}
                className="rounded-lg"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} de 4`}
              >
                <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
                  <Image
                    fill
                    className="object-cover"
                    alt={t(slide.key)}
                    src={slide.img}
                    priority
                  />

                  {/* Overlay fluido */}
                  <div
                    className="
                      absolute inset-0
                      bg-gradient-to-r
                      from-black/80
                      via-black/40
                      to-transparent
                      flex items-center
                    "
                  >
                    <div className=" w-full p-10 flex">
                      <div className="w-full md:!w-[50%]">
                        <Title
                          as="h2"
                          size="sm"
                          font="bold"
                          colVariant="on"
                          className="drop-shadow-lg"
                        >
                          {t(slide.key)}
                        </Title>
                        <Text
                          size="md"
                          colVariant="on"
                          className="mt-4"
                          tKey={t("subMensajeInfo")}
                          translate="yes"
                        />
                        <Button
                          className="flex gap-2 items-center justify-center transition-transform"
                          colVariant="warning"
                          rounded="lg"
                          size="full"
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
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <div>
            <Title as="h2" size="md" font="bold">
              ¿En qué ayuda ComplexesPH?
            </Title>

            <Text className="mt-4 text-gray-600 leading-relaxed">
              ComplexesPH apoya a los conjuntos residenciales en la
              modernización de su gestión, la mejora de la comunicación y la
              generación de valor económico, respetando siempre su reglamento
              interno y su autonomía administrativa.
            </Text>

            <Button colVariant="primary" rounded="lg" className="mt-6">
              Conocer más
            </Button>
          </div>

          {/* Imagen */}
          <div className="relative flex justify-center">
            <Image
              src="/devices-complexes.png"
              alt="ComplexesPH en computador y celular"
              width={520}
              height={420}
              className="rounded-2xl shadow-xl"
              priority
            />

            {/* Detalle decorativo */}
            <div className="absolute -z-10 -top-6 -right-6 w-40 h-40 bg-blue-100 rounded-full blur-2xl"></div>
          </div>
        </div>
      </section>

      <section
        className="bg-gray-100 rounded-md mt-4 py-12 px-6"
        aria-labelledby="benefits-title"
      >
        <Title
          id="benefits-title"
          as="h2"
          size="sm"
          translate="yes"
          font="semi"
          className="text-center"
        >
          Beneficios por pertenecer al club
        </Title>

        <div className="grid md:grid-cols-3 gap-8 text-center mt-2" role="list">
          {[
            {
              icon: "💰",
              title: "Incentivos económicos para el conjunto",
              text: "Los conjuntos afiliados al Club pueden recibir un porcentaje por alquileres gestionados a través de la plataforma, según su plan activo. Un ingreso adicional que beneficia directamente a la copropiedad.",
            },
            {
              icon: "🏘️",
              title: "Red de conjuntos afiliados",
              text: "Forma parte de una red privada de conjuntos residenciales donde se comparten experiencias, buenas prácticas, proveedores y oportunidades entre miembros del Club.",
            },
            {
              icon: "🔒",
              title: "Control, reglas y tranquilidad",
              text: "El Club permite gestionar alquileres, accesos y actividades respetando el reglamento interno de cada conjunto, brindando transparencia al consejo y tranquilidad a los residentes.",
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
              <Title size="sm" font="bold">
                {b.title}
              </Title>
              <Text size="sm">{b.text}</Text>
            </div>
          ))}
        </div>
      </section>

      {filteredData?.length > 0 && (
        <section className="py-12 px-6" aria-labelledby="featured-immovables">
          <Title
            id="featured-immovables"
            tKey={t("inmueblesdestacados")}
            size="sm"
            as="h2"
            font="bold"
          >
            Inmuebles destacados
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {filteredData.slice(0, 3).map((e) => {
              const infodata = e.files.map((file) =>
                typeof file === "string" ? file : file.filename,
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
              );
            })}
          </div>
        </section>
      )}

      {/* Contadores */}
      <section
        className="relative text-white py-20 bg-cover bg-center scale-75"
        style={{ backgroundImage: "url('/imageultra.jpg')" }}
        aria-label="Conjuntos fundadores"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70"></div>

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Texto principal */}
          <div className="text-center lg:text-left">
            <Title as="h2" className="text-4xl font-bold mb-4">
              Conjuntos Fundadores ComplexesPH Club
            </Title>

            <Text size="md" className="text-white/90 max-w-xl mx-auto lg:mx-0">
              Buscamos los primeros conjuntos que quieran liderar la nueva forma
              de gestionar, conectar y generar valor en comunidad.
            </Text>
            <Button
              colVariant="warning"
              size="lg"
              rounded="lg"
              onClick={handleClickFundation}
            >
              Postular mi conjunto como fundador
            </Button>
          </div>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center flex flex-col justify-between min-h-[250px] w-">
              <Title as="h3" className="text-3xl font-bold">
                8
              </Title>
              <Text className="mt-2">Conjuntos Fundadores</Text>
              <Text size="sm" className="text-white/80 mt-2">
                Cupos limitados en Colombia
              </Text>
            </div>

            {/* Card 2 */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center flex flex-col justify-between min-h-[180px]">
              <Title as="h3" className="text-2xl font-bold">
                Beneficios
              </Title>
              <Text className="mt-2">De por vida</Text>
              <Text size="sm" className="text-white/80 mt-2">
                Condiciones preferenciales y beneficios congelados
              </Text>
            </div>
          </div>
        </div>
      </section>
      <FooterComplex />
    </div>
  );
}
