"use client";
import React from "react";
import useQueryFavoriteHoliday from "./useQueryFavoriteHoliday";

export default function HolidayFavoritos() {
  const { data } = useQueryFavoriteHoliday();
  return <div> {JSON.stringify(data)} holiday-favoritos</div>;
}
