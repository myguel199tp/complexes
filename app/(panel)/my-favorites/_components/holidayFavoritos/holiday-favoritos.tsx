"use client";

import React from "react";
import useQueryFavoriteHoliday from "./useQueryFavoriteHoliday";
import { ICreateFavorite } from "@/app/(dashboard)/holiday/services/response/favoriteResponse";
import { ImSpinner9 } from "react-icons/im";
import MessageNotData from "@/app/components/messageNotData";

export default function HolidayFavoritos() {
  const { data, isLoading } = useQueryFavoriteHoliday();

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  if (!data || data.length === 0)
    return (
      <div className="text-center py-10 text-gray-500">
        <MessageNotData />
      </div>
    );

  return (
    <div className="w-full">
      {data.map((item: ICreateFavorite) => (
        <div
          key={item.property} // no existe item.id en tu interfaz, así que uso property
          className="border rounded-xl shadow-md p-4 bg-white hover:shadow-lg transition"
        >
          {/* Título y código */}
          <h2 className="text-lg font-bold">{item.name}</h2>
          <p className="text-gray-500 text-sm mb-2">Código: {item.codigo}</p>

          {/* Ubicación */}
          <p className="text-sm">
            <strong>Ubicación:</strong> {item.city}
            {item.neigborhood ? `, ${item.neigborhood}` : ""}
          </p>

          {/* Máximos huéspedes */}
          <p className="text-sm mt-1">
            <strong>Máx. huéspedes:</strong> {item.maxGuests}
          </p>

          {/* Precio */}
          <p className="text-sm mt-1">
            <strong>Precio:</strong> {item.price} {item.currency || "COP"}
          </p>

          {/* Habitaciones */}
          <div className="mt-3">
            <strong className="text-sm">Habitaciones:</strong>
            <ul className="text-sm mt-1 list-disc ml-5">
              {item.bedRooms?.map((r, idx) => (
                <li key={idx}>
                  {r.name}: {r.beds} cama(s)
                </li>
              ))}
            </ul>
          </div>

          {/* Descripción */}
          <p className="text-sm mt-3 text-gray-700 line-clamp-3">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}
