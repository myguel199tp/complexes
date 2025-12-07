/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import useQueryInternInmovable from "./useQueryInternInmovable";

export default function Publications() {
  const { data } = useQueryInternInmovable();

  if (!data || data.length === 0) {
    return (
      <div className="w-full flex justify-center items-center h-40">
        <p className="text-gray-500 text-lg font-medium">
          No hay publicaciones disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {data.map((item: any) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl shadow-md overflow-hidden transition-transform hover:scale-[1.02]"
        >
          {/* Galería de imágenes */}
          <div className="grid grid-cols-3 gap-1 h-64">
            {/* Imagen principal (toma 2 columnas y 2 filas) */}
            {item.files?.[0] && (
              <img
                src={item.files[0]}
                className="col-span-2 row-span-2 w-full h-full object-cover rounded-l-2xl"
                alt="principal"
              />
            )}

            {/* Imágenes adicionales */}
            {item.files?.slice(1).map((img: string, i: number) => (
              <img
                key={i}
                src={img}
                className="w-full h-full object-cover rounded"
                alt={`img-${i}`}
              />
            ))}
          </div>

          {/* Contenido */}
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-700">
              ${item.price} {item.currency}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {item.neighborhood}, {item.city}
            </p>

            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
              {item.description}
            </p>

            {/* Info */}
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>🚪 {item.room} Hab</span>
              <span>🛁 {item.restroom} Baños</span>
              <span>📐 {item.area} m²</span>
            </div>

            {/* Botones */}
            <div className="flex justify-between mt-4">
              <button
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition"
                onClick={() => console.log("EDITAR", item.id)}
              >
                <Pencil size={18} />
                Editar
              </button>

              <button
                className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-xl hover:bg-red-700 transition"
                onClick={() => console.log("ELIMINAR", item.id)}
              >
                <Trash2 size={18} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
