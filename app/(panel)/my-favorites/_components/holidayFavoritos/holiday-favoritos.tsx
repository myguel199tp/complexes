"use client";

import React from "react";
import useQueryFavoriteHoliday from "./useQueryFavoriteHoliday";
import { ImSpinner9 } from "react-icons/im";
import MessageNotData from "@/app/components/messageNotData";
import { ICreateFavorite } from "@/app/(panel)/holiday/services/response/favoriteResponse";
import { Text } from "complexes-next-components";

export default function HolidayFavoritos() {
  const { data, isLoading } = useQueryFavoriteHoliday();

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  if (!data || data?.length === 0)
    return (
      <div className="text-center py-10 text-gray-500">
        <MessageNotData />
      </div>
    );

  return (
    <div className="w-full">
      {data?.map((item: ICreateFavorite) => (
        <div
          key={item.property}
          className="border rounded-xl shadow-md p-4 bg-white hover:shadow-lg transition"
        >
          <Text as="h2" font="bold" className="text-lg">{item.name}</Text>
          <Text size="sm" className="text-gray-500 mb-2">Código: {item.codigo}</Text>

          <Text size="sm">
            <strong>Ubicación:</strong> {item.city}
            {item.neigborhood ? `, ${item.neigborhood}` : ""}
          </Text>

          <Text size="sm" className="mt-1">
            <strong>Máx. huéspedes:</strong> {item.maxGuests}
          </Text>

          <Text size="sm" className="mt-1">
            <strong>Precio:</strong> {item.price} {item.currency || "COP"}
          </Text>

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

          <Text size="sm" className="mt-3 text-gray-700 line-clamp-3">
            {item.description}
          </Text>
        </div>
      ))}
    </div>
  );
}
