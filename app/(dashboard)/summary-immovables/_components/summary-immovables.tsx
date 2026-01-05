"use client";
import React, { useEffect, useState } from "react";
import { Button, InputField, Title, Text } from "complexes-next-components";
import { useRouter, useSearchParams } from "next/navigation";
import { immovableSummaryService } from "../services/summary-inmovables-service";
import { InmovableResponses } from "../../immovables/services/response/inmovableResponses";
import ShareButtons from "./shareButtons";
import Summary from "./card-summary/summary";
import ModalSummary from "./modal/modal";
import { ImSpinner9 } from "react-icons/im";
import Map from "./map";
import ModalVideo from "./modal/modal-video";
import { IoHeartCircleSharp } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { route } from "@/app/_domain/constants/routes";
import { useMutationFavoritesInmovables } from "./use-mutation-favorites";
import { ICreateFavoriteInmovable } from "../services/response/favoriteInmovableResponse";
import RegisterOptions from "@/app/(panel)/my-new-immovable/_components/property/_components/regsiter-options";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function SummaryImmovables() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [data, setData] = useState<InmovableResponses>();
  const [loading, setLoading] = useState<boolean>(true);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);

  const { t } = useTranslation();
  const { language } = useLanguage();

  const router = useRouter();
  const payload = getTokenPayload();
  const { mutate } = useMutationFavoritesInmovables();
  const { amenitiesOptions, anemitieUnityOptions } = RegisterOptions();

  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  const openModal = () => setShowSummary(true);
  const closeModal = () => setShowSummary(false);

  const openVideo = () => setShowVideo(true);
  const closeVideo = () => setShowVideo(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await immovableSummaryService({ id: id ?? undefined });
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (!data) return;

    const params = new URLSearchParams({
      street: data.address || "",
      suburb: data.neighborhood || "",
      city: data.city || "",
      country: data.country || "",
      format: "json",
      limit: "1",
      countrycodes: "co",
      bounded: "1",
    });

    const fetchCoords = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  }

  return (
    <div
      key={language}
      className="max-w-7xl mx-auto my-6 bg-white shadow-lg rounded-xl overflow-hidden"
    >
      <div className="relative bg-cyan-800 text-center py-1 px-3">
        <div className="absolute top-1 left-3">
          <Text font="bold" colVariant="on">
            {data?.codigo}
          </Text>
        </div>

        <div>
          <Title size="sm" font="bold" colVariant="on">
            {data?.property} en{" "}
            {data?.ofert === "1" ? `${t("venta")}` : `${t("arriendo")}`}
          </Title>
          <Text size="md" colVariant="on">
            {data?.neighborhood}, {data?.country}, {data?.city}
          </Text>
        </div>

        <div className="absolute top-1 right-3">
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
                files:
                  data?.files
                    ?.filter((f) => typeof f.filename === "string")
                    .map((f) => f.filename) ?? [],
              };

              mutate(payload);
            }}
          />{" "}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 p-6 items-start">
        {data?.files && (
          <div className="w-full flex justify-center bg-gray-200">
            <Summary images={data.files} />
          </div>
        )}

        <div className="flex flex-col justify-between space-y-6">
          <div>
            <Text size="sm" font="semi" tKey={t("descripcion")}>
              Descripción
            </Text>
            <Text
              size="sm"
              className="text-gray-700 text-justify leading-relaxed"
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
                {/* {data?.amenitiesResident || ""} */}
                {(data?.amenitiesResident ?? [])
                  .map((id) => {
                    const found = anemitieUnityOptions.find(
                      (opt) => opt.value === id
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
              <Text
                size="sm"
                className="text-gray-700 text-justify leading-relaxed"
              >
                {(data?.amenities ?? [])
                  .map((id) => {
                    const found = amenitiesOptions.find(
                      (opt) => opt.value === id
                    );
                    return found ? found.label : id;
                  })
                  .join(" | ")}
              </Text>
            </div>
          </section>

          <div className="grid sm:grid-cols-3 gap-3">
            <InputField
              disabled
              value={`${data?.room ?? 0} ${t("habitaciones")}`}
            />
            <InputField
              disabled
              value={`${data?.restroom ?? 0} ${t("baños")}`}
            />
            <InputField
              disabled
              value={`${data?.parking ?? 0} ${t("parqueos")}`}
            />
            <InputField disabled value={`${data?.area ?? 0} m²`} />
            <InputField
              disabled
              value={`${formatCurrency(Number(data?.price))} ${
                data?.currency ?? ""
              }`}
            />
            <InputField
              disabled
              value={`${formatCurrency(Number(data?.administration))} ${
                data?.currency ?? ""
              }`}
            />
            <div className="flex gap-2">
              <InputField
                disabled
                value={`${data?.indicative ?? ""}`.trim() || " "}
              />
              <InputField
                disabled
                value={`${data?.phone ?? ""}`.trim() || " "}
              />
            </div>
          </div>

          {/* Mapa */}
          {!showSummary && (
            <>
              {!showVideo && (
                <>
                  {" "}
                  {coords && (
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <Map lat={coords.lat} lng={coords.lng} label="" />
                    </div>
                  )}{" "}
                </>
              )}
            </>
          )}

          {/* Botones */}
          <div className="flex justify-center gap-4 pt-2">
            <ShareButtons neigborhood={data?.neighborhood} city={data?.city} />
            <Button
              colVariant="warning"
              size="md"
              onClick={openModal}
              tKey={t("contactar")}
            >
              Contactar
            </Button>
            {(data?.videos || data?.videoUrl) && (
              <Button
                size="sm"
                colVariant="warning"
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

      {/* Modal */}
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
