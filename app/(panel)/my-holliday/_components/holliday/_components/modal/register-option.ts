"use client";

import { useAmenitieData } from "@/app/(panel)/my-holliday/_components/holliday/_components/fetch-amenitie-data";
export default function RegisterOptions() {
  const { data: amenities } = useAmenitieData();

  const amenitiesOptions =
    amenities?.map((amenities) => ({
      value: `${amenities.ids}`,
      label: `${amenities.name}`,
    })) || [];

  return {
    amenitiesOptions,
  };
}
