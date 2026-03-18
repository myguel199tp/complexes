/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
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
import { useMyAddQuery } from "./use-myadd-query";

export default function Adds() {
  const { data } = useMyAddQuery();
  const [openFormId, setOpenFormId] = useState<string | null>(null);
  const [openProductId, setOpenProductId] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div className="w-full min-h-screen p-10 bg-gradient-to-br from-gray-50 via-white to-gray-100 space-y-12">
      {!data || data?.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MessageNotData />
        </div>
      ) : (
        data?.map((ele) => (
          <div
            key={ele.id}
            className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
          >
            <section className="flex flex-col lg:flex-row gap-12 p-10">
              <div className="lg:w-1/3 space-y-6">
                <Title as="h4" size="md" font="semi">
                  {ele.name}
                </Title>

                {ele.files?.length > 0 && (
                  <div className="relative rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={`${BASE_URL}/uploads/${ele.files[0].replace(
                        /^.*[\\/]/,
                        "",
                      )}`}
                      alt={ele.name}
                      className="w-full h-56 object-cover transition duration-700 hover:scale-110"
                    />
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <Text className="font-semibold text-gray-700">Datos</Text>
                  <Text>{ele.phone}</Text>
                  <Text>📧 {ele.email}</Text>

                  {ele.webPage && (
                    <Link href={ele.webPage} target="_blank">
                      <Text className="text-blue-600 hover:underline">
                        🌐 Página Web
                      </Text>
                    </Link>
                  )}

                  <Text className="text-gray-600 pt-2">{ele.description}</Text>
                </div>

                <div className="flex items-center gap-5 text-2xl pt-4">
                  {ele.facebookred && (
                    <Link href={ele.facebookred} target="_blank">
                      <FaFacebook className="text-blue-600 hover:scale-125 transition" />
                    </Link>
                  )}
                  {ele.instagramred && (
                    <Link href={ele.instagramred} target="_blank">
                      <FaInstagram className="text-pink-500 hover:scale-125 transition" />
                    </Link>
                  )}
                  {ele.tiktokred && (
                    <Link href={ele.tiktokred} target="_blank">
                      <FaTiktok className="hover:scale-125 transition" />
                    </Link>
                  )}
                  {ele.youtubered && (
                    <Link href={ele.youtubered} target="_blank">
                      <FaYoutube className="text-red-600 hover:scale-125 transition" />
                    </Link>
                  )}
                  {ele.xred && (
                    <Link href={ele.xred} target="_blank">
                      <FaXTwitter className="hover:scale-125 transition" />
                    </Link>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 pt-6">
                  <Button size="sm" className="bg-blue-600 text-white">
                    Editar
                  </Button>

                  <Button size="sm" className="bg-red-600 text-white">
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

              <div className="lg:w-2/3">
                {ele.products.length === 0 ? (
                  <Text className="text-gray-400 text-sm text-center mt-10">
                    Aún no tiene productos registrados
                  </Text>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {ele.products.map((elem, index) => {
                      const isOpen = openProductId === elem.id;

                      return (
                        <div
                          key={elem.id ?? index}
                          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
                        >
                          {elem.files?.length > 0 && (
                            <div className="relative h-52 overflow-hidden">
                              <img
                                src={`${BASE_URL}/uploads/${elem.files[0].replace(
                                  /^.*[\\/]/,
                                  "",
                                )}`}
                                alt={elem.name}
                                className="w-full h-full object-cover transition duration-700 hover:scale-110"
                              />
                            </div>
                          )}

                          <div className="p-5 space-y-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {elem.name}
                            </h3>

                            <p className="text-sm text-gray-500 line-clamp-2">
                              {elem.description}
                            </p>

                            <div className="flex justify-between items-center pt-2">
                              <span className="text-lg font-bold text-green-600">
                                ${elem.price}
                              </span>

                              <button
                                onClick={() =>
                                  setOpenProductId(isOpen ? null : elem.id)
                                }
                                className="text-sm font-medium text-blue-600 hover:underline"
                              >
                                {isOpen ? "Cerrar detalle ↑" : "Ver detalle →"}
                              </button>
                            </div>

                            {isOpen && (
                              <div className="mt-4 p-4 bg-gray-50 rounded-xl border text-sm text-gray-600 space-y-2">
                                <p>
                                  <strong>Categoría:</strong>{" "}
                                  {elem.category || "No definida"}
                                </p>

                                <p>
                                  <strong>Estado:</strong> {elem.status}
                                </p>

                                <p>
                                  <strong>ID:</strong> {elem.id}
                                </p>

                                <p className="pt-2 text-gray-500">
                                  Aquí puedes agregar más información como stock
                                  disponible, garantía, métodos de pago, envíos,
                                  etc.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {openFormId === ele.id && (
              <div className="border-t p-10 bg-gray-50">
                <FormProduct sellerId={ele.id} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
