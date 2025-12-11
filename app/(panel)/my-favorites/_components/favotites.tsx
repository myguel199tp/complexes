"use client";
import React from "react";
import HolidayFavoritos from "./holidayFavoritos/holiday-favoritos";
import Inmovablesfavoritos from "./inmovabelsfavoritos/inmovables-favoritos";
import { Title } from "complexes-next-components";

export default function Favotites() {
  return (
    <div className="flex flex-col md:!flex-row justify-between w-full gap-4">
      <div className="w-full">
        <Title size="sm" font="bold">
          {" "}
          Reservas vacacionales favoritas{" "}
        </Title>
        <HolidayFavoritos />
      </div>
      <div className="w-full">
        <Title size="sm" font="bold">
          {" "}
          Inmuebles favoritos{" "}
        </Title>
        <Inmovablesfavoritos />
      </div>
    </div>
  );
}
