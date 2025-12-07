"use client";
import React from "react";
import useQueryFavoriteInmovable from "./useQueryFavoriteInmovable";

export default function Inmovablesfavoritos() {
  const { data } = useQueryFavoriteInmovable();
  return <div> {JSON.stringify(data)} inmovables-favoritos</div>;
}
