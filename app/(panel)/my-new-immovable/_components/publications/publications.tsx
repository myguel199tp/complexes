/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import useQueryInternInmovable from "./useQueryInternInmovable";
import MessageNotData from "@/app/components/messageNotData";
import { fileUrl } from "@/app/helpers/fileUrl";
import { Text, Title } from "complexes-next-components";

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

  const getImageUrl = (filename: string) => {
    const fileName = filename.replace(/^.*[\\/]/, "");
    return fileUrl(fileName);
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
              <Title as="h2" size="xs" font="bold" className="text-gray-900">
                ${item.price.toLocaleString()}
                <span className="ml-2 text-base text-gray-500">
                  {item.currency}
                </span>
              </Title>

              <Text size="sm" className="text-gray-500 mt-1">
                {item.neighborhood}, {item.city}
              </Text>

              <Text size="sm" className="text-gray-600 mt-3 line-clamp-3">
                {item.description}
              </Text>

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
            <Title as="h2" size="xs" font="bold" className="mb-4">Editar publicación</Title>

            <div className="space-y-3">
              <Text size="sm">
                <strong>Precio:</strong>{" "}
                {selectedPublication.price.toLocaleString()}
              </Text>

              <Text size="sm">
                <strong>Ubicación:</strong> {selectedPublication.neighborhood}
              </Text>

              <Text size="sm">
                <strong>Descripción:</strong> {selectedPublication.description}
              </Text>
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
            <Title as="h2" size="xs" font="bold" colVariant="danger" className="mb-4">
              Eliminar publicación
            </Title>

            <Text size="sm" className="text-gray-600">
              ¿Estás seguro de eliminar esta publicación?
            </Text>

            <Text size="sm" font="semi" className="mt-3">
              {selectedPublication.neighborhood}, {selectedPublication.city}
            </Text>

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
