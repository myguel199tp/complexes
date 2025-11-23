"use client";

import React, { useState } from "react";
import { useTableInfo } from "./table-info";
import { Title, Text, Button } from "complexes-next-components";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";
import Link from "next/link";
import FormProduct from "./product/form-product";

export default function Adds() {
  const { data } = useTableInfo();

  // Estado para mostrar el formulario por ID del seller (string | null)
  const [openFormId, setOpenFormId] = useState<string | null>(null);

  return (
    <div className="w-full p-4 space-y-6">
      {data.map((ele) => (
        <div
          key={ele.id}
          className="p-5 bg-white shadow-md rounded-xl border border-gray-200"
        >
          {/* Título */}
          <Title as="h5" size="md" font="semi" className="mb-4">
            {ele.name}
          </Title>

          {/* Grid de imágenes */}
          {ele.files?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
              {ele.files.map((path, index) => (
                <div
                  key={index}
                  className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden shadow-sm"
                >
                  <img
                    src={`/${path.replace(/\\/g, "/")}`}
                    alt="Imagen"
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Información */}
          <div className="space-y-1 mb-4">
            <Text className="font-bold text-gray-700">Datos</Text>

            <Text className="text-gray-700">{ele.phone}</Text>
            <Text className="text-gray-700">📧 {ele.email}</Text>

            {ele.webPage && (
              <Link href={ele.webPage} target="_blank">
                <Text className="text-blue-600 underline cursor-pointer">
                  🌐 Página Web
                </Text>
              </Link>
            )}

            <Text className="text-gray-800 mt-2">{ele.description}</Text>
          </div>

          {/* Redes sociales */}
          <div className="flex items-center gap-4 text-2xl mb-4">
            {ele.facebookred && (
              <Link href={ele.facebookred} target="_blank">
                <FaFacebook className="text-blue-600 hover:scale-110 transition" />
              </Link>
            )}

            {ele.instagramred && (
              <Link href={ele.instagramred} target="_blank">
                <FaInstagram className="text-pink-500 hover:scale-110 transition" />
              </Link>
            )}

            {ele.tiktokred && (
              <Link href={ele.tiktokred} target="_blank">
                <FaTiktok className="hover:scale-110 transition" />
              </Link>
            )}

            {ele.youtubered && (
              <Link href={ele.youtubered} target="_blank">
                <FaYoutube className="text-red-600 hover:scale-110 transition" />
              </Link>
            )}

            {ele.xred && (
              <Link href={ele.xred} target="_blank">
                <FaXTwitter className="hover:scale-110 transition" />
              </Link>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Editar
            </Button>

            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Eliminar
            </Button>

            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() =>
                setOpenFormId(openFormId === ele.id ? null : ele.id)
              }
            >
              Agregar productos
            </Button>
          </div>

          {/* Mostrar Formulario SOLO del item clickeado */}
          {openFormId === ele.id && (
            <div className="mt-6 border-t pt-6">
              <FormProduct />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
