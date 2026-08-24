"use client";

import React from "react";
import useQueryFavoriteInmovable from "./useQueryFavoriteInmovable";
import Image from "next/image";
import { ImSpinner9 } from "react-icons/im";
import MessageNotData from "@/app/components/messageNotData";
import { Text } from "complexes-next-components";

export default function InmovablesFavoritos() {
  const { data, isLoading } = useQueryFavoriteInmovable();

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
      {data?.map((item) => (
        <div
          key={item.id}
          className="border rounded-xl shadow-md p-4 bg-white hover:shadow-lg transition"
        >
          {item.files?.[0] && (
            <div className="relative w-full h-52 rounded-lg overflow-hidden mb-3">
              <Image
                src={item.files[0]}
                fill
                alt={item.codigo}
                className="object-cover"
              />
            </div>
          )}

          <Text as="h2" font="bold" className="text-lg">Código: {item.codigo}</Text>

          <Text size="sm" className="mt-1">
            <strong>Barrio:</strong> {item.neighborhood}
          </Text>

          <Text size="sm" className="mt-1">
            <strong>Ciudad:</strong> {item.city}
          </Text>

          <Text size="sm" className="mt-1">
            <strong>Habitaciones:</strong> {item.room}
          </Text>

          <Text size="sm" className="mt-1">
            <strong>Baños:</strong> {item.restroom}
          </Text>

          <Text size="sm" className="mt-1">
            <strong>Área:</strong> {item.area} m²
          </Text>

          <Text size="sm" font="semi" colVariant="success" className="mt-1">
            Precio: {item.price} {item.currency}
          </Text>

          <Text size="sm" className="mt-2 text-gray-700 line-clamp-3">
            {item.description}
          </Text>
        </div>
      ))}
    </div>
  );
}
