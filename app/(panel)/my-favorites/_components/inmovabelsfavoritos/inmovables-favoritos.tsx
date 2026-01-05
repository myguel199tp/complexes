"use client";

import React from "react";
import useQueryFavoriteInmovable from "./useQueryFavoriteInmovable";
import Image from "next/image";
import { ImSpinner9 } from "react-icons/im";

export default function InmovablesFavoritos() {
  const { data, isLoading } = useQueryFavoriteInmovable();

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  if (!data || data.length === 0) return <div>No tienes favoritos aún.</div>;

  return (
    <div className="w-full">
      {data.map((item: any) => (
        <div
          key={item.id}
          className="border rounded-xl shadow-md p-4 bg-white hover:shadow-lg transition"
        >
          {/* Imagen si existe */}
          {item.files?.[0]?.url && (
            <div className="relative w-full h-52 rounded-lg overflow-hidden mb-3">
              <Image
                src={item.files[0].url}
                fill
                alt={item.codigo}
                className="object-cover"
              />
            </div>
          )}

          <h2 className="text-lg font-bold">Código: {item.codigo}</h2>

          <p className="text-sm mt-1">
            <strong>Barrio:</strong> {item.neighborhood}
          </p>

          <p className="text-sm mt-1">
            <strong>Ciudad:</strong> {item.city}
          </p>

          <p className="text-sm mt-1">
            <strong>Habitaciones:</strong> {item.room}
          </p>

          <p className="text-sm mt-1">
            <strong>Baños:</strong> {item.restroom}
          </p>

          <p className="text-sm mt-1">
            <strong>Área:</strong> {item.area} m²
          </p>

          <p className="text-sm mt-1 text-green-700 font-semibold">
            Precio: {item.price} {item.currency}
          </p>

          <p className="text-sm mt-2 text-gray-700 line-clamp-3">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}
