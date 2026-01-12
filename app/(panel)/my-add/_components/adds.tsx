/* eslint-disable @next/next/no-img-element */
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
import MessageNotData from "@/app/components/messageNotData";

export default function Adds() {
  const { data } = useTableInfo();
  const [openFormId, setOpenFormId] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return (
    <div className="w-full p-4 space-y-6">
      {!data || data.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      ) : (
        data.map((ele) => (
          <div
            key={ele.id}
            className="p-5 bg-white shadow-md rounded-xl border border-gray-200"
          >
            <section className="flex gap-2">
              <div className="w-[50%]">
                <Title as="h5" size="sm" font="semi" className="mb-2">
                  {ele.name}
                </Title>

                {/* Imágenes */}
                {ele.files?.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                    {ele.files.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="w-full bg-gray-100 rounded-lg overflow-hidden shadow-sm"
                      >
                        <img
                          src={`${BASE_URL}/uploads/${image.replace(
                            /^.*[\\/]/,
                            ""
                          )}`}
                          alt={`imagen-${index}`}
                          className="object-cover h-full w-full"
                        />
                      </div>
                    ))}
                  </div>
                )}

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

                {/* Redes */}
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
                  <Button size="sm" className="bg-blue-600 text-white">
                    Editar
                  </Button>

                  <Button size="sm" className="bg-blue-600 text-white">
                    Eliminar
                  </Button>

                  <Button
                    size="sm"
                    className="bg-green-600 text-white"
                    onClick={() =>
                      setOpenFormId(openFormId === ele.id ? null : ele.id)
                    }
                  >
                    Agregar producto
                  </Button>
                </div>
              </div>

              {/* Productos */}
              <div className="w-[50%]">
                {ele.products.length === 0 ? (
                  <Text className="text-gray-400 text-sm text-center mt-6">
                    Este vendedor aún no tiene productos registrados
                  </Text>
                ) : (
                  ele.products.map((elem, index) => (
                    <div
                      key={elem.id ?? index}
                      className="mb-3 p-2 border rounded"
                    >
                      <Text>{elem.name}</Text>
                      <Text>{elem.description}</Text>
                      <Text>{elem.category}</Text>
                      <Text>{elem.price}</Text>
                      <Text>{elem.status}</Text>
                    </div>
                  ))
                )}
              </div>
            </section>

            {openFormId === ele.id && (
              <div className="mt-6 border-t pt-6">
                <FormProduct sellerId={ele.id} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
