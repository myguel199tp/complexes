/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import useQueryInternInmovable from "./useQueryInternInmovable";
import MessageNotData from "@/app/components/messageNotData";

/* =========================
   Backend Response Type
========================= */

interface InmovableResponses {
  id: string;
  price: string; // 👈 backend manda string
  currency: string;
  neighborhood: string;
  city: string;
  description: string;
  room: number;
  restroom: number;
  area: number;
  files?: {
    id: string;
    filename: string;
  }[];
}

/* =========================
   Frontend Model
========================= */

interface Publication {
  id: string;
  price: number; // 👈 aquí sí lo queremos como number
  currency: string;
  neighborhood: string;
  city: string;
  description: string;
  room: number;
  restroom: number;
  area: number;
  files?: {
    id: string;
    filename: string;
  }[];
}

/* =========================
   Mapper
========================= */

function mapToPublication(data: InmovableResponses[]): Publication[] {
  return data.map((item) => ({
    ...item,
    price: Number(item.price), // 👈 conversión real
  }));
}

export default function Publications() {
  const { data } = useQueryInternInmovable();

  // Transformación segura y memoizada
  const publications = useMemo(() => {
    if (!data) return [];
    return mapToPublication(data as []);
  }, [data]);

  if (!publications.length) {
    return (
      <div className="text-center py-10 text-gray-500">
        <MessageNotData />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {publications.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl shadow-md overflow-hidden transition-transform hover:scale-[1.02]"
        >
          {/* ================= IMÁGENES ================= */}
          <div className="grid grid-cols-3 gap-1 h-64">
            {item.files?.[0] && (
              <img
                src={item.files[0].filename}
                className="col-span-2 row-span-2 w-full h-full object-cover rounded-l-2xl"
                alt="principal"
              />
            )}

            {item.files?.slice(1).map((file, index) => (
              <img
                key={file.id}
                src={file.filename}
                className="w-full h-full object-cover rounded"
                alt={`img-${index}`}
              />
            ))}
          </div>

          {/* ================= INFO ================= */}
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-700">
              ${item.price.toLocaleString()} {item.currency}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {item.neighborhood}, {item.city}
            </p>

            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
              {item.description}
            </p>

            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>🚪 {item.room} Hab</span>
              <span>🛁 {item.restroom} Baños</span>
              <span>📐 {item.area} m²</span>
            </div>

            <div className="flex justify-between mt-4">
              <button
                type="button"
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition"
                onClick={() => console.log("EDITAR", item.id)}
              >
                <Pencil size={18} />
                Editar
              </button>

              <button
                type="button"
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
