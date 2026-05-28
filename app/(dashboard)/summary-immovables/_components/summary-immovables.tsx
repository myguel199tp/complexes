"use client";
import React, { useEffect, useState } from "react";
import { Button, InputField, Text } from "complexes-next-components";
import { useRouter, useSearchParams } from "next/navigation";
import Summary from "./card-summary/summary";
import ModalSummary from "./modal/modal";
import { ImSpinner9 } from "react-icons/im";
import ModalVideo from "./modal/modal-video";
import { IoHeartCircleSharp } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { route } from "@/app/_domain/constants/routes";
import { useMutationFavoritesInmovables } from "./use-mutation-favorites";
import { ICreateFavoriteInmovable } from "../services/response/favoriteInmovableResponse";
import RegisterOptions from "@/app/(panel)/my-new-immovable/_components/property/_components/regsiter-options";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";
import ShareButtons from "./shareButtons";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import dynamic from "next/dynamic";
import { useImmovableSummaryQuery } from "./useImmovableSummaryQuery";

const Map = dynamic(() => import("./map"), {
  ssr: false,
});
export default function SummaryImmovables() {
  const searchParams = useSearchParams();
  const {
    countryOptions,
    data: datacountry,
    PropertyOptions,
  } = useCountryCityOptions();

  const id = searchParams.get("id");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);

  const { t } = useTranslation();
  const { language } = useLanguage();

  const router = useRouter();
  const { mutate } = useMutationFavoritesInmovables();
  const { amenitiesOptions, anemitieUnityOptions } = RegisterOptions();

  const openModal = () => setShowSummary(true);
  const closeModal = () => setShowSummary(false);

  const openVideo = () => setShowVideo(true);
  const closeVideo = () => setShowVideo(false);
  const storedUserId = useConjuntoStore((state) => state.userId);

  const { data, isLoading } = useImmovableSummaryQuery(id ?? undefined);

  useEffect(() => {
    if (!data) return;

    const params = new URLSearchParams({
      street: data?.address || "",
      suburb: data?.neighborhood || "",
      city: data?.city || "",
      country: data?.country || "",
      format: "json",
      limit: "1",
      countrycodes: "co",
      bounded: "1",
    });

    const fetchCoords = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result: { lat: string; lon: string }[] = await res.json();
        if (result.length > 0) {
          setCoords({
            lat: parseFloat(result[0].lat),
            lng: parseFloat(result[0].lon),
          });
        }
      } catch (err) {
        console.error("Error geocoding:", err);
      }
    };

    fetchCoords();
  }, [data]);

  const formatCurrency = (value: number) => {
    const currency = data?.currency || "COP";

    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const countryUnit =
    countryOptions.find((c) => c.value === String(data?.country))?.label ||
    data?.country;

  const cityUnit =
    datacountry
      ?.find((c) => String(c.ids) === String(data?.country))
      ?.city?.find((c) => String(c.id) === String(data?.city))?.name ||
    data?.city;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  }

  const propertyUnit =
    PropertyOptions.find((p) => p.value === String(data?.property))?.label ||
    data?.property;

  return (
    <div
      key={language}
      className="w-full max-w-7xl mx-auto my-4 sm:my-6 bg-white shadow-lg rounded-xl overflow-hidden"
    >
      <div className="relative bg-cyan-800 text-center py-3 px-4 sm:px-6">
        {" "}
        <div className="absolute top-2 left-2 sm:left-4">
          {" "}
          <Text font="bold" size="xxs" colVariant="on">
            {data?.codigo}
          </Text>
        </div>
        <div>
          <Text size="sm" font="bold" colVariant="on" className="px-10 sm:px-0">
            {" "}
            {propertyUnit} en{" "}
            {data?.ofert === "1" ? `${t("venta")}` : `${t("arriendo")}`}
          </Text>
          <Text size="sm" colVariant="on">
            {data?.neighborhood}, {countryUnit}, {cityUnit}
          </Text>
        </div>
        <div className="absolute top-2 right-2 sm:right-4">
          {" "}
          <IoHeartCircleSharp
            size={33}
            className="cursor-pointer text-white hover:text-red-600 transition-colors"
            onClick={() => {
              if (!storedUserId) {
                router.push(route.auth);
                return;
              }

              const payload: ICreateFavoriteInmovable = {
                iduser: storedUserId,
                ofert: data?.ofert,
                email: data?.email ?? "",
                phone: data?.phone ?? "",
                codigo: data?.codigo ?? "",
                currency: data?.currency ?? "COP",
                parking: data?.parking,
                neighborhood: data?.neighborhood ?? "",
                amenitiesResident: data?.amenitiesResident,
                amenities: data?.amenities,
                address: data?.address ?? "",
                country: data?.country ?? "",
                city: data?.city,
                property: data?.property,
                price: Number(data?.price) ?? 0,
                room: data?.room,
                restroom: data?.restroom,
                age: data?.age,
                administration: data?.administration,
                area: Number(data?.area) ?? 0,
                indicative: data?.indicative ?? "+57",
                description: data?.description ?? "",
                videoUrl: data?.videoUrl,
                videos: data?.videos,
                files: data?.files ?? [],
              };

              mutate(payload);
            }}
          />{" "}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-3 sm:p-4 md:p-6 items-start">
        {" "}
        {data?.files && (
          <div className="w-full flex justify-center bg-gray-200 rounded-lg overflow-hidden">
            {" "}
            <Summary images={data?.files ?? []} />
          </div>
        )}
        <div className="flex flex-col justify-between space-y-4 sm:space-y-6">
          {" "}
          <div>
            <Text size="sm" font="semi" tKey={t("descripcion")}>
              Descripción
            </Text>
            <Text
              size="sm"
              className=" text-justify leading-relaxed break-words"
            >
              {data?.description || ""}
            </Text>
          </div>
          <section>
            <div>
              <Text size="sm" font="semi" tKey={t("amenidadResidencial")}>
                Amenidades Unidad residencial{" "}
              </Text>
              <Text
                size="sm"
                className="text-gray-700 text-justify leading-relaxed"
              >
                {(data?.amenitiesResident ?? [])
                  .map((id) => {
                    const found = anemitieUnityOptions.find(
                      (opt) => opt.value === id,
                    );
                    return found ? found.label : id;
                  })
                  .join(" | ")}
              </Text>
            </div>
            <div>
              <Text size="sm" font="semi" tKey={t("amenidades")}>
                Amenidades
              </Text>
              <Text size="sm" className="text-justify leading-relaxed">
                {(data?.amenities ?? [])
                  .map((id) => {
                    const found = amenitiesOptions.find(
                      (opt) => opt.value === id,
                    );
                    return found ? found.label : id;
                  })
                  .join(" | ")}
              </Text>
            </div>
          </section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {" "}
            <InputField
              helpText={t("habitaciones")}
              inputSize="xs"
              disabled
              value={`${data?.room ?? 0} ${t("habitaciones")}`}
            />
            <InputField
              helpText={t("baños")}
              inputSize="xs"
              disabled
              value={`${data?.restroom ?? 0} ${t("baños")}`}
            />
            <InputField
              helpText={t("parqueos")}
              inputSize="xs"
              disabled
              value={`${data?.parking ?? 0} ${t("parqueos")}`}
            />
            <InputField
              helpText={t("area")}
              inputSize="xs"
              disabled
              value={`${data?.area ?? 0} m²`}
            />
            <InputField
              helpText="Precio"
              inputSize="xs"
              disabled
              value={`${formatCurrency(Number(data?.price))} ${
                data?.currency ?? ""
              }`}
            />
            <InputField
              helpText="Precio de administración"
              inputSize="xs"
              disabled
              value={`${formatCurrency(Number(data?.administration))} ${
                data?.currency ?? ""
              }`}
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:col-span-2 lg:col-span-3">
              {" "}
              <InputField
                helpText={t("indicativo")}
                inputSize="xs"
                disabled
                value={`${data?.indicative ?? ""}`.trim() || " "}
              />
              <InputField
                helpText={t("telefono")}
                inputSize="xs"
                disabled
                value={`${data?.phone ?? ""}`.trim() || " "}
              />
            </div>
          </div>
          {!showSummary && (
            <>
              {!showVideo && (
                <>
                  {" "}
                  {coords && (
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm h-[250px] sm:h-[320px]">
                      {" "}
                      <Map lat={coords.lat} lng={coords.lng} label="" />
                    </div>
                  )}{" "}
                </>
              )}
            </>
          )}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 pt-2">
            {" "}
            <div className="w-full sm:w-auto">
              <ShareButtons
                neigborhood={data?.neighborhood}
                city={data?.city}
              />
            </div>
            <Button
              colVariant="success"
              size="sm"
              onClick={openModal}
              tKey={t("contactar")}
            >
              Contactar
            </Button>
            {(data?.videos || data?.videoUrl) && (
              <Button
                size="sm"
                colVariant="success"
                tKey={t("vervideo")}
                rounded="md"
                onClick={openVideo}
              >
                Ver video
              </Button>
            )}
          </div>
        </div>
      </div>

      {showSummary && <ModalSummary isOpen onClose={closeModal} />}
      {showVideo && (
        <ModalVideo
          isOpen
          onClose={closeVideo}
          videoUrl={data?.videoUrl}
          videos={data?.videos}
        />
      )}
    </div>
  );
}
