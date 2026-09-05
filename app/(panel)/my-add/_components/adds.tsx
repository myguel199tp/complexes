/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Title, Text, Button } from "complexes-next-components";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaPhoneAlt,
  FaGlobe,
} from "react-icons/fa";
import { FiMail, FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import Link from "next/link";
import FormProduct from "./product/form-product";
import FormService from "./service/form-service";
import MessageNotData from "@/app/components/messageNotData";
import { useMyAddQuery } from "./use-myadd-query";
import { FaXTwitter } from "react-icons/fa6";
import { fileUrl } from "@/app/helpers/fileUrl";

export default function Adds() {
  const { data } = useMyAddQuery();

  // Qué formulario está abierto en cada negocio: el de productos o el de
  // servicios. Son distintos porque un servicio pide duración y agenda.
  const [openForm, setOpenForm] = useState<{
    id: string;
    kind: "product" | "service";
  } | null>(null);
  const [openProductId, setOpenProductId] = useState<string | null>(null);

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      {!data || data?.length === 0 ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <MessageNotData />
        </div>
      ) : (
        <div className="space-y-10">
          {data?.map((ele) => (
            <div
              key={ele.id}
              className="
                relative overflow-hidden
                rounded-[30px]
                border border-black/10
                bg-black/[0.04]
                backdrop-blur-xl
                shadow-[0_0_40px_rgba(0,0,0,0.25)]
              "
            >
              {/* Glow */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full" />

              <section className="relative z-10 flex flex-col xl:flex-row gap-10 p-5 md:p-8">
                {/* LEFT */}
                <div className="xl:w-[340px] shrink-0">
                  <div className="sticky top-5 space-y-6">
                    {/* Image */}
                    {ele.files?.length > 0 && (
                      <div className="relative group overflow-hidden rounded-3xl border border-black/10">
                        <img
                          src={fileUrl(ele.files[0])}
                          alt={ele.name}
                          className="
                            w-full h-[260px] object-cover
                            transition duration-700
                            group-hover:scale-110
                          "
                        />

                        <div
                          className="
                            absolute inset-0
                            bg-gradient-to-t
                            from-black/80 via-black/10 to-transparent
                          "
                        />

                        <div className="absolute bottom-0 left-0 p-5">
                          <Title as="h4" size="md" font="semi" colVariant="on">
                            {ele.name}
                          </Title>

                          <Text className=" text-sm" colVariant="success">
                            Publicación activa
                          </Text>
                        </div>
                      </div>
                    )}

                    {/* Info */}
                    <div
                      className="
                        rounded-3xl
                        border border-black/10
                        bg-black/[0.05]
                        p-5
                        backdrop-blur-lg
                        space-y-4
                      "
                    >
                      <Text
                        className="uppercase tracking-widest"
                        size="sm"
                        colVariant="on"
                        font="bold"
                      >
                        Información
                      </Text>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 ">
                          <FaPhoneAlt className="text-cyan-900" />
                          <Text size="sm" colVariant="on">
                            {ele.phone}
                          </Text>
                        </div>

                        <div className="flex items-center gap-3 ">
                          <FiMail className="text-cyan-900" />
                          <Text size="sm" colVariant="on">
                            {ele.email}
                          </Text>
                        </div>

                        {ele.webPage && (
                          <Link href={ele.webPage} target="_blank">
                            <div className="flex items-center gap-3 text-cyan-900 hover:text-cyan-300 transition">
                              <FaGlobe />
                              <Text size="sm" colVariant="on">
                                Página Web
                              </Text>
                            </div>
                          </Link>
                        )}
                      </div>

                      <div className="pt-2">
                        <Text
                          className="leading-relaxed"
                          size="sm"
                          colVariant="on"
                        >
                          {ele.description}
                        </Text>
                      </div>

                      {/* Social */}
                      <div className="flex items-center gap-3 pt-4">
                        {ele.facebookred && (
                          <Link href={ele.facebookred} target="_blank">
                            <div
                              className="
                                w-11 h-11 rounded-2xl
                                bg-black/5 border border-black/10
                                flex items-center justify-center
                                text-blue-400
                                hover:scale-110 hover:bg-blue-500/20
                                transition-all duration-300
                              "
                            >
                              <FaFacebook />
                            </div>
                          </Link>
                        )}

                        {ele.instagramred && (
                          <Link href={ele.instagramred} target="_blank">
                            <div
                              className="
                                w-11 h-11 rounded-2xl
                                bg-black/5 border border-black/10
                                flex items-center justify-center
                                text-pink-400
                                hover:scale-110 hover:bg-pink-500/20
                                transition-all duration-300
                              "
                            >
                              <FaInstagram />
                            </div>
                          </Link>
                        )}

                        {ele.tiktokred && (
                          <Link href={ele.tiktokred} target="_blank">
                            <div
                              className="
                                w-11 h-11 rounded-2xl
                                bg-black/5 border border-black/10
                                flex items-center justify-center
                                text-black
                                hover:scale-110 hover:bg-black/10
                                transition-all duration-300
                              "
                            >
                              <FaTiktok />
                            </div>
                          </Link>
                        )}

                        {ele.youtubered && (
                          <Link href={ele.youtubered} target="_blank">
                            <div
                              className="
                                w-11 h-11 rounded-2xl
                                bg-black/5 border border-black/10
                                flex items-center justify-center
                                text-red-400
                                hover:scale-110 hover:bg-red-500/20
                                transition-all duration-300
                              "
                            >
                              <FaYoutube />
                            </div>
                          </Link>
                        )}

                        {ele.xred && (
                          <Link href={ele.xred} target="_blank">
                            <div
                              className="
                                w-11 h-11 rounded-2xl
                                bg-black/5 border border-black/10
                                flex items-center justify-center
                                text-gray-100
                                hover:scale-110 hover:bg-black/10
                                transition-all duration-300
                              "
                            >
                              <FaXTwitter />
                            </div>
                          </Link>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-1 gap-3 pt-5">
                        <Button size="sm" colVariant="primary">
                          <div className="flex items-center gap-2">
                            <FiEdit2 />
                            Editar
                          </div>
                        </Button>

                        <Button size="sm" colVariant="danger">
                          <div className="flex items-center gap-2">
                            <FiTrash2 />
                            Eliminar
                          </div>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() =>
                            setOpenForm(
                              openForm?.id === ele.id &&
                                openForm.kind === "product"
                                ? null
                                : { id: ele.id, kind: "product" },
                            )
                          }
                          colVariant="success"
                        >
                          <div className="flex items-center gap-2">
                            <FiPlus />
                            Agregar producto
                          </div>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() =>
                            setOpenForm(
                              openForm?.id === ele.id &&
                                openForm.kind === "service"
                                ? null
                                : { id: ele.id, kind: "service" },
                            )
                          }
                          colVariant="warning"
                        >
                          <div className="flex items-center gap-2">
                            <FiPlus />
                            Agregar servicio
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRODUCTS */}
                <div className="flex-1 space-y-6">
                  {/* Servicios publicados: hasta ahora el vendedor no tenía
                      dónde verlos, porque el catálogo de servicios ni siquiera
                      llegaba al frontend. */}
                  {(ele.services?.length ?? 0) > 0 && (
                    <div className="space-y-2">
                      <Text
                        colVariant="on"
                        className="font-semibold uppercase tracking-widest text-xs"
                      >
                        Servicios agendables
                      </Text>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {ele.services?.map((service) => (
                          <div
                            key={service.id}
                            className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <Title as="h4" size="xs" font="semi" className="text-emerald-900">
                                {service.name}
                              </Title>
                              <span className="font-bold text-emerald-700">
                                ${Number(service.price).toLocaleString("es-CO")}
                              </span>
                            </div>

                            <Text size="xs" className="mt-1 text-emerald-800/70 line-clamp-2">
                              {service.description}
                            </Text>

                            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-emerald-700">
                              <span className="rounded-full bg-white/70 px-2 py-0.5">
                                {service.durationMinutes} min
                              </span>
                              <span className="rounded-full bg-white/70 px-2 py-0.5">
                                Avisar {service.minNoticeHours}h antes
                              </span>
                              <span className="rounded-full bg-white/70 px-2 py-0.5">
                                Hasta {service.maxDaysAhead} días
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {ele.products.length === 0 ? (
                    <div
                      className="
                        h-full min-h-[300px]
                        rounded-3xl
                        border border-dashed border-black/10
                        flex items-center justify-center
                        text-gray-500
                      "
                    >
                      Aún no tiene productos registrados
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                      {ele.products.map((elem, index) => {
                        const isOpen = openProductId === elem.id;

                        return (
                          <div
                            key={elem.id ?? index}
                            className="
                              group overflow-hidden
                              rounded-3xl
                              border border-black/10
                              bg-black/[0.04]
                              backdrop-blur-xl
                              transition-all duration-500
                              hover:-translate-y-1
                              hover:border-cyan-400/30
                              hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]
                            "
                          >
                            {elem.files?.length > 0 && (
                              <div className="relative h-56 overflow-hidden">
                                <img
                                  src={fileUrl(elem.files[0])}
                                  alt={elem.name}
                                  className="
                                    w-full h-full object-cover
                                    transition duration-700
                                    group-hover:scale-110
                                  "
                                />

                                <div
                                  className="
                                    absolute inset-0
                                    bg-gradient-to-t
                                    from-black/80 via-black/10 to-transparent
                                  "
                                />
                              </div>
                            )}

                            <div className="p-5 space-y-4">
                              <div>
                                <Text as="h3" font="semi" className="text-black text-lg">
                                  {elem.name}
                                </Text>

                                <Text size="sm" className="text-gray-400 mt-2 line-clamp-2">
                                  {elem.description}
                                </Text>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-cyan-900">
                                  ${elem.price}
                                </span>

                                <button
                                  onClick={() =>
                                    setOpenProductId(isOpen ? null : elem.id)
                                  }
                                  className="
                                    px-4 py-2 rounded-xl
                                    bg-black/10
                                    text-sm text-black
                                    hover:bg-cyan-500 hover:text-black
                                    transition-all
                                  "
                                >
                                  {isOpen ? "Cerrar" : "Detalle"}
                                </button>
                              </div>

                              {isOpen && (
                                <div
                                  className="
                                    rounded-2xl
                                    bg-black/20
                                    border border-black/10
                                    p-4 text-sm text-gray-300
                                    space-y-2
                                  "
                                >
                                  <Text size="sm">
                                    <strong className="text-cyan-900">
                                      Categoría:
                                    </strong>{" "}
                                    {elem.category || "No definida"}
                                  </Text>

                                  <Text size="sm">
                                    <strong className="text-cyan-900">
                                      Estado:
                                    </strong>{" "}
                                    {elem.status}
                                  </Text>

                                  <Text size="sm">
                                    <strong className="text-cyan-900">
                                      ID:
                                    </strong>{" "}
                                    {elem.id}
                                  </Text>
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

              {openForm?.id === ele.id && (
                <div className="border-t border-black/10 bg-black/20 p-6 md:p-10">
                  {openForm.kind === "product" ? (
                    <FormProduct sellerId={ele.id} />
                  ) : (
                    <FormService sellerId={ele.id} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
