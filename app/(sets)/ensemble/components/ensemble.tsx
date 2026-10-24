"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { Title, Text, Avatar } from "complexes-next-components";
import { useConjuntoStore } from "./use-store";
import { useEnsembleInfo } from "./ensemble-info";
import { useLanguage } from "@/app/hooks/useLanguage";
import Link from "next/link";
import ModalWelcome from "./modal/modal";
import { useCountryCityOptions } from "../../registers/_components/register-option";
import LogoutPage from "@/app/components/ui/close";
import { useSidebarInformation } from "@/app/components/ui/sidebar-information";
import { StatusService } from "../service/statusConjuntoStevice";
import TrustedDevices from "./trusted-devices";
import { fileUrl } from "@/app/helpers/fileUrl";
import {
  SeasonalParticles,
  useSeasonalTheme,
} from "@/app/components/ui/seasonal";

const ROLE_LABELS: Record<string, string> = {
  tenant: "Arrendado",
  owner: "Propietario",
  employee: "Colaborador",
};

export default function Ensemble() {
  const router = useRouter();
  const { valueState } = useSidebarInformation();
  const { userRolName } = valueState;

  const hasRole = (role: string) => userRolName.includes(role);

  const { data } = useEnsembleInfo();
  const { countryOptions, data: datacountry } = useCountryCityOptions();
  const { language } = useLanguage();

  const setPlan = useConjuntoStore((state) => state.setPlan);
  const setConjuntoId = useConjuntoStore((state) => state.setConjuntoId);
  const setConjuntoImage = useConjuntoStore((state) => state.setConjuntoImage);
  const setConjuntoName = useConjuntoStore((state) => state.setConjuntoName);
  const setUserName = useConjuntoStore((state) => state.setUserName);
  const setUserLastName = useConjuntoStore((state) => state.setUserLastName);
  const setUserNumberId = useConjuntoStore((state) => state.setUserNumberId);
  const setImage = useConjuntoStore((state) => state.setImage);
  const setAddress = useConjuntoStore((state) => state.setAddress);
  const setCity = useConjuntoStore((state) => state.setCity);
  const setCountry = useConjuntoStore((state) => state.setCountry);
  const setNeighborhood = useConjuntoStore((state) => state.setNeighborhood);
  const setReside = useConjuntoStore((state) => state.setReside);
  const setRole = useConjuntoStore((state) => state.setRole);
  const setIsActive = useConjuntoStore((state) => state.setIsActive);
  const srtUserId = useConjuntoStore((state) => state.setUserId);
  const setConcejo = useConjuntoStore((state) => state.setConcejo);
  const setConjuntoApartment = useConjuntoStore(
    (state) => state.setConjuntoApartment,
  );
  const setConjuntoTower = useConjuntoStore((state) => state.setConjuntoTower);

  const [showModal, setShowModal] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  // En temporada (Halloween, Navidad...) la barra superior toma sus colores.
  const season = useSeasonalTheme();
  useEffect(() => {
    if (data?.some((item) => item.role === "visitor")) {
      setShowModal(true);
    }
  }, [data]);

  return (
    <div
      key={language}
      className="
    relative
    min-h-screen
    overflow-hidden
    pb-10
    md:pt-32
    bg-[#050816]
    "
    >
      {/* BACKGROUND IMAGE */}
      <div
        className="
      absolute
      inset-0
      bg-cover
      bg-center
      scale-105
      "
        style={{
          backgroundImage: "url('/cici.jpg')",
        }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-[#050816]/80" />

      {/* GRADIENT OVERLAY */}
      <div
        className="
      absolute
      inset-0
      bg-gradient-to-br
      from-cyan-500/10
      via-transparent
      to-purple-600/20
      "
      />

      {/* AMBIENT LIGHTS */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 blur-3xl rounded-full" />

      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 blur-3xl rounded-full" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" />

      {/* GRID OVERLAY */}
      <div
        className="
      absolute
      inset-0
      opacity-[0.05]
      bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)]
      bg-[size:40px_40px]
      "
      />

      {/* CONTENT */}
      <div className="relative z-10">
        {/* HEADER: en móvil va en el flujo (fija tapaba las tarjetas porque
            al apilarse mide más que el padding superior); fija desde md. */}
        <header
          className="
        relative
        md:fixed
        md:top-0
        md:left-0
        z-50
        w-full
        border-b
        border-white/10
        "
        >
          {/* El blur y el overflow van en una capa aparte: en el propio header
              backdrop-filter convierte al header en el bloque contenedor de
              los hijos `fixed` y overflow-hidden los recorta, así que el panel
              de dispositivos de confianza quedaba atrapado dentro. */}
          <div
            aria-hidden
            className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
          bg-black/20
          backdrop-blur-2xl
          "
            style={
              season
                ? {
                    backgroundImage: `linear-gradient(100deg, ${season.colors.from}, ${season.colors.to})`,
                  }
                : undefined
            }
          >
            {season && (
              <SeasonalParticles
                theme={season}
                count={14}
                variant="float"
                className="opacity-50"
              />
            )}
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex w-full min-w-0 gap-3 items-center sm:gap-5 md:w-auto">
              <Avatar
                src="/icon.png"
                alt={"globaliaph"}
                size="xl"
                border="thick"
                shape="round"
                className="h-14 w-14 shrink-0 md:h-[96px] md:w-[96px]"
              />

              <div className="min-w-0">
                <Title as="h2" size="sm" font="bold" className="text-white">
                  Bienvenido a globaliaph
                </Title>

                {season ? (
                  <Text className="text-white/90 text-sm font-bold">
                    <span aria-hidden className="season-wiggle mr-1">
                      {season.emoji}
                    </span>
                    {season.greeting}
                  </Text>
                ) : (
                  <Text className="text-white/60 text-sm">
                    Plataforma residencial inteligente
                  </Text>
                )}
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 md:w-auto md:flex-nowrap">
              <Link
                href="/return-password"
                className="
              py-2
              text-sm
              text-cyan-300
              hover:text-cyan-200
              transition-colors
              "
              >
                Cambiar contraseña
              </Link>

              <TrustedDevices />

              <LogoutPage className="mt-0" />
            </div>
          </div>
        </header>

        <main className="px-4 pt-6 md:pt-8">
          {/* ALERT */}
          {hasRole("user") && (
            <div
              className="
          max-w-md
          mx-auto
          mb-6
          rounded-2xl
          border
          border-cyan-400/20
          bg-cyan-500/10
          backdrop-blur-xl
          p-4
          shadow-[0_0_30px_rgba(34,211,238,0.15)]
          "
            >
              <Text className="text-cyan-100 text-center">
                Bienvenido a la nueva experiencia globaliaph
              </Text>
            </div>
          )}

          {/* RENTA VACACIONAL: reservar no exige pertenecer a un conjunto, así
              que va aquí y no dentro de una comunidad. Para quien no tiene
              conjunto es la única puerta al panel. */}
          <div className="max-w-md mx-auto mb-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
            <Text className="text-white font-semibold text-center">
              Renta vacacional
            </Text>
            <Text className="text-white/60 text-sm text-center mt-1">
              Busca alojamiento y revisa tus reservas, tengas o no conjunto.
            </Text>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              <Link
                href={route.holiday}
                className="rounded-full bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/30 transition-colors"
              >
                Buscar alojamiento
              </Link>
              <Link
                href={route.myvacations}
                className="rounded-full border border-cyan-400/30 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/10 transition-colors"
              >
                Mis reservas
              </Link>
            </div>
          </div>

          {/* TITLE */}
          {data?.length > 0 && (
            <div
              className="
          max-w-4xl
          mx-auto
          text-center
          mb-8
          md:mb-11
          "
            >
              <div
                className="
            inline-flex
            items-center
            gap-2
            px-4
            sm:px-6
            py-3
            rounded-full
            border
            border-cyan-400/20
            bg-white/5
            backdrop-blur-xl
            shadow-[0_0_30px_rgba(34,211,238,0.15)]
            "
              >
                <div className="w-2 h-2 shrink-0 rounded-full bg-cyan-400 animate-pulse" />

                <Text size="md" font="bold" className="text-white">
                  Selecciona un conjunto para continuar
                </Text>
              </div>
            </div>
          )}

          {/* GRID */}
          <div
            className="
        relative
        z-10
        max-w-7xl
        mx-auto
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        gap-5
        sm:gap-8
        "
          >
            {data?.map((item) => {
              const {
                id,
                apartment,
                tower,
                role,
                isMainResidence,
                conjunto,
                user,
              } = item;

              const fileImage = conjunto?.file || "";

              const fileName = fileImage ? fileUrl(fileImage) : "";

              const countryLabel =
                countryOptions.find((c) => c.value === String(conjunto.country))
                  ?.label || conjunto.country;

              const cityLabel =
                datacountry
                  ?.find((c) => String(c.ids) === String(conjunto.country))
                  ?.city.find((c) => String(c.id) === String(conjunto.city))
                  ?.name || conjunto.city;

              const roleLabel = ROLE_LABELS[role] ?? "";

              return (
                <div
                  key={id}
                  onClick={async () => {
                    setLoadingId(id);

                    try {
                      // 1. Guardar estado local del conjunto
                      setConjuntoId(conjunto.id);
                      setConjuntoName(conjunto.name);
                      setConjuntoImage(conjunto.file);
                      setConjuntoApartment(String(apartment));
                      setConjuntoTower(String(tower));
                      setUserName(user.name);
                      setUserLastName(user.lastName);
                      setUserNumberId(user.numberId);
                      setPlan(conjunto.plan);
                      setImage(user.file);
                      setNeighborhood(conjunto.neighborhood);
                      setAddress(conjunto.address);
                      setCity(conjunto.city);
                      setReside(isMainResidence);
                      setRole(role);
                      setIsActive(conjunto.isActive);
                      srtUserId(user.id);
                      setConcejo(user.council);
                      setCountry(conjunto.country);

                      // 2. VALIDAR ESTADO REAL DE PAGO
                      const status = await StatusService(conjunto.id);

                      // 3. DECISIÓN FINAL
                      if (status.isActive) {
                        router.push(route.myprofile);
                      } else {
                        router.push("/welcome");
                      }
                    } catch (error) {
                      console.error(
                        "Error verificando estado del conjunto",
                        error,
                      );
                      router.push("/welcome");
                    } finally {
                      setLoadingId(null);
                    }
                  }}
                  className="
              group
              relative
              overflow-hidden
              rounded-3xl
              sm:rounded-[32px]
              border
              border-white/10
              bg-white/5
              backdrop-blur-2xl
              p-5
              sm:p-6
              transition-all
              duration-500
              hover:-translate-y-2
              hover:border-cyan-400/30
              hover:bg-white/10
              hover:shadow-[0_0_40px_rgba(34,211,238,0.2)]
              cursor-pointer
              "
                >
                  {/* CARD GLOW */}
                  <div
                    className="
                absolute
                inset-0
                opacity-0
                group-hover:opacity-100
                transition-opacity
                duration-500
                bg-gradient-to-br
                from-cyan-500/10
                via-transparent
                to-purple-500/10
                "
                  />

                  {/* TOP LINE */}
                  <div
                    className="
                absolute
                top-0
                left-0
                h-[2px]
                w-0
                bg-gradient-to-r
                from-cyan-400
                to-purple-500
                transition-all
                duration-500
                group-hover:w-full
                "
                  />

                  <section className="relative z-10 flex flex-col gap-5 sm:gap-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Title
                          size="sm"
                          font="bold"
                          className="text-white break-words"
                        >
                          {conjunto.name}
                        </Title>

                        <Text className="text-white/60 text-sm mt-2 break-words">
                          {conjunto.address}
                        </Text>

                        <Text className="text-white/40 text-xs mt-1">
                          {countryLabel} • {cityLabel}
                        </Text>
                      </div>

                      <div
                        className="
                    relative
                    shrink-0
                    rounded-full
                    p-[2px]
                    bg-gradient-to-br
                    from-cyan-400
                    to-purple-500
                    shadow-[0_0_20px_rgba(34,211,238,0.35)]
                    "
                      >
                        <Avatar
                          src={fileName}
                          border="none"
                          alt={`${conjunto.name}`}
                          size="xxl"
                          shape="round"
                          className="h-20 w-20 md:h-28 md:w-28 xl:h-[150px] xl:w-[150px]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        {apartment !== null && (
                          <Text
                            className="
                        text-cyan-300
                        font-bold
                        text-lg
                        "
                          >
                            {tower}-{apartment}
                          </Text>
                        )}

                        <Text className="text-white/40 text-xs">
                          {conjunto.neighborhood}
                        </Text>
                      </div>

                      {roleLabel && (
                        <div
                          className="
                      shrink-0
                      px-3
                      sm:px-4
                      py-2
                      rounded-full
                      border
                      border-cyan-400/20
                      bg-cyan-400/10
                      text-cyan-200
                      text-xs
                      uppercase
                      tracking-wider
                      sm:tracking-widest
                      "
                        >
                          {roleLabel}
                        </div>
                      )}
                    </div>

                    <div
                      className="
                  flex
                  items-center
                  justify-between
                  border-t
                  border-white/10
                  pt-4
                  "
                    >
                      <Text className="text-white/40 text-sm">
                        Entrar al conjunto
                      </Text>

                      <div
                        className="
                      w-10
                      h-10
                      rounded-full
                      bg-cyan-400/10
                      flex
                      items-center
                      justify-center
                      text-cyan-300
                      transition-all
                      duration-300
                      group-hover:translate-x-1
                    "
                      >
                        {loadingId === id ? (
                          <div
                            className="
                          w-5
                          h-5
                          border-2
                          border-cyan-300/30
                          border-t-cyan-300
                          rounded-full
                          animate-spin
                        "
                          />
                        ) : (
                          "→"
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              );
            })}
          </div>
        </main>

        {showModal && (
          <ModalWelcome isOpen onClose={() => setShowModal(false)} />
        )}
      </div>
    </div>
  );
}
