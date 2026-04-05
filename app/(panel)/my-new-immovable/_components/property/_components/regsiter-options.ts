"use client";

import { useAmenitieData } from "@/app/(panel)/my-holliday/_components/holliday/_components/fetch-amenitie-data";
import { useAmenityUnityData } from "./fetch-amenities-unity-data";
import { useAntiquityData } from "./fetch-antiquity-data";
import { useOfertData } from "./fetch-ofert-data";
import { useParkingData } from "./fetch-parking-data";
import { usePropertyData } from "./fetch-property-data";
import { useRestroomData } from "./fetch-restroom-data";
import { useRoomData } from "./fetch-room-data";
import { useStratumData } from "./fetch-stratum-data";
import { useTranslation } from "react-i18next";

export default function RegisterOptions() {
  const { t } = useTranslation();

  const { data: parkings } = useParkingData();
  const { data: antiquitys } = useAntiquityData();
  const { data: restrooms } = useRestroomData();
  const { data: rooms } = useRoomData();
  const { data: ofert } = useOfertData();
  const { data: property } = usePropertyData();
  const { data: stratum } = useStratumData();
  const { data: unity } = useAmenityUnityData();
  const { data: amenities } = useAmenitieData();

  const parkingOptions =
    parkings?.map((parking) => ({
      value: `${parking.ids}`,
      label: `${parking.name} ${t("parqueos")}`,
    })) || [];

  const antiquitygOptions =
    antiquitys?.map((antiquity) => ({
      value: `${antiquity.ids}`,
      label: `${antiquity.name} ${t("años")}`,
    })) || [];

  const restroomOptions =
    restrooms?.map((restroom) => ({
      value: `${restroom.ids}`,
      label: `${restroom.name} ${t("baños")}`,
    })) || [];

  const roomOptions =
    rooms?.map((room) => ({
      value: `${room.ids}`,
      label: `${room.name} ${t("habitaciones")}`,
    })) || [];

  const ofertOptions =
    ofert?.map((ofertItem) => ({
      value: `${ofertItem.ids}`,
      label: t(ofertItem.name),
    })) || [];

  const propertyOptions =
    property?.map((propertyItem) => ({
      value: `${propertyItem.ids}`,
      label: t(propertyItem.name),
    })) || [];

  const stratumOptions =
    stratum?.map((stratumItem) => ({
      value: `${stratumItem.ids}`,
      label: t(stratumItem.name),
    })) || [];

  const anemitieUnityOptions =
    unity?.map((unityItem) => ({
      value: `${unityItem.ids}`,
      label: t(unityItem.name),
    })) || [];

  const amenitiesOptions =
    amenities?.map((amenitiesItem) => ({
      value: `${amenitiesItem.ids}`,
      label: `${amenitiesItem.name}`,
    })) || [];

  return {
    antiquitygOptions,
    parkingOptions,
    restroomOptions,
    roomOptions,
    ofertOptions,
    propertyOptions,
    stratumOptions,
    anemitieUnityOptions,
    amenitiesOptions,
  };
}
