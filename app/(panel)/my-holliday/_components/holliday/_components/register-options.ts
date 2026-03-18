"use client";

import { useAmenitieData } from "./fetch-amenitie-data";

import { useHolidayPropertyData } from "./fetch-property-data";

export default function RegisterOptions() {

  const { data: amenities } = useAmenitieData();
  const { data: property } = useHolidayPropertyData();

  const amenitiesOptions =
    amenities?.map((amenities) => ({
      value: `${amenities.ids}`,
      label: `${amenities.name}`,
    })) || [];

  const PropertyOptions =
    property?.map((property) => ({
      value: `${property.ids}`,
      label: `${property.name}`, 
    })) || [];

  return {
    amenitiesOptions,
    PropertyOptions,
  };
}
