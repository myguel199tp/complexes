/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import useQueryInternInmovable from "./useQueryInternInmovable";
import MessageNotData from "@/app/components/messageNotData";

interface InmovableResponses {
  id: string;
  price: string;
  currency: string;
  neighborhood: string;
  city: string;
  description: string;
  room: string;
  restroom: string;
  area: number;
  files?: string[];
}

interface Publication {
  id: string;
  price: number;
  currency: string;
  neighborhood: string;
  city: string;
  description: string;
  room: number;
  restroom: number;
  area: number;
  files?: string[];
}

function mapToPublication(data: InmovableResponses[]): Publication[] {
  return data.map((item) => ({
    ...item,
    price: Number(item.price),
    room: Number(item.room),
    restroom: Number(item.restroom),
  }));
}

export default function Publications() {
  const { data } = useQueryInternInmovable();

  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const publications = useMemo(() => {
    if (!data) return [];
    return mapToPublication(data as []);
  }, [data]);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

  const getImageUrl = (filename: string) => {
    const fileName = filename.replace(/^.*[\\/]/, "");
    return `${BASE_URL}/uploads/${fileName}`;
  };

  if (!publications.length) {
    return (
      <div className="text-center py-10 text-gray-500">
        <MessageNotData />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {publications.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition"
          >
            {/* Galería */}
            <div className="grid grid-cols-3 gap-1 auto-rows-[120px] p-2">
              {item.files?.map((file, index) => (
                <img
                  key={index}
                  src={getImageUrl(file)}
                  className={`w-full h-full object-cover rounded-md ${
                    index === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                  alt={`img-${index}`}
                />
              ))}
            </div>

            {/* Información */}
            <div className="p-5">
              <h2 className="text-2xl font-bold text-gray-900">
                ${item.price.toLocaleString()}
                <span className="ml-2 text-base text-gray-500">
                  {item.currency}
                </span>
              </h2>

              <p className="text-gray-500 mt-1">
                {item.neighborhood}, {item.city}
              </p>

              <p className="text-gray-600 mt-3 line-clamp-3">
                {item.description}
              </p>

              <div className="flex justify-between mt-4 py-3 border-y">
                <span>🚪 {item.room} Hab</span>
                <span>🛁 {item.restroom} Baños</span>
                <span>📐 {item.area} m²</span>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
                  onClick={() => {
                    setSelectedPublication(item);
                    setOpenEdit(true);
                  }}
                >
                  <Pencil size={18} />
                  Editar
                </button>

                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700"
                  onClick={() => {
                    setSelectedPublication(item);
                    setOpenDelete(true);
                  }}
                >
                  <Trash2 size={18} />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Editar */}
      {openEdit && selectedPublication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4">
            <h2 className="text-2xl font-bold mb-4">Editar publicación</h2>

            <div className="space-y-3">
              <p>
                <strong>Precio:</strong>{" "}
                {selectedPublication.price.toLocaleString()}
              </p>

              <p>
                <strong>Ubicación:</strong> {selectedPublication.neighborhood}
              </p>

              <p>
                <strong>Descripción:</strong> {selectedPublication.description}
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpenEdit(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancelar
              </button>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {openDelete && selectedPublication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Eliminar publicación
            </h2>

            <p className="text-gray-600">
              ¿Estás seguro de eliminar esta publicación?
            </p>

            <p className="mt-3 font-semibold">
              {selectedPublication.neighborhood}, {selectedPublication.city}
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpenDelete(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancelar
              </button>

              <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
