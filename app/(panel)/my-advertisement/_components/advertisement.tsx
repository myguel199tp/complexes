"use client";

import React, { useState } from "react";
import { Text, InputField, Button } from "complexes-next-components";
import AdvertisementInfo from "./advertisement-info";
import Cardinfo from "./card-advertidement/card-info";
import { Product as AddProduct } from "@/app/(panel)/my-add/services/response/addResponse";
import { Product as AdvProduct } from "@/app/(panel)/my-advertisement/services/response/advertisementResponse";
import MessageNotData from "@/app/components/messageNotData";
import { MdLocalGroceryStore } from "react-icons/md";
import { useCartStore } from "./cart.store";
import FormPayment from "./card-advertidement/modal/form";

export default function Advertisement() {
  const { filteredData, formState, setFormState } = AdvertisementInfo();
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { items, removeProduct, total } = useCartStore();

  return (
    <div className="flex gap-2 max-w-[1600px] h-auto px-4">
      <div
        className={`transition-all duration-300 ${
          showCart ? "w-full lg:w-3/4" : "w-full"
        }`}
      >
        <section className="sticky top-0 z-20 bg-gradient-to-r from-cyan-700 via-cyan-800 to-blue-900 rounded-2xl shadow-xl backdrop-blur-sm border border-white/10">
          <div className="flex justify-between items-center px-5 pt-5 pb-3">
            <div>
              <p className="text-white font-bold text-base leading-snug">
                Marketplace de la comunidad
              </p>
              <p className="text-cyan-200/70 text-xs mt-0.5">
                Encuentra productos y servicios de tus vecinos
              </p>
            </div>

            <button
              onClick={() => setShowCart((prev) => !prev)}
              className="relative flex items-center justify-center bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all duration-200 rounded-2xl p-3 border border-white/15 shadow-inner"
            >
              <MdLocalGroceryStore size={24} className="text-white" />

              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[11px] font-bold min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full shadow-lg">
                  {items.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-3 px-5 pb-4">
            <InputField
              placeholder="Buscar emprendimiento, producto o servicio..."
              rounded="lg"
              value={formState.search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormState((prev) => ({ ...prev, search: e.target.value }))
              }
            />
            <Button
              size="md"
              colVariant="success"
              onClick={() => {
                setShowFilters(!showFilters);
              }}
            >
              Filtros
            </Button>
          </div>
          {showFilters && (
            <div className="mt-5 space-y-4 p-4">
              {/* FILTROS TOP */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Tipo */}
                <select
                  value={formState.typeOfert}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      typeOfert: e.target.value,
                    }))
                  }
                  className="
        h-12 px-4 rounded-2xl
        bg-white/10 backdrop-blur-xl
        border border-white/15
        text-white
        outline-none
        shadow-lg
      "
                >
                  <option value="" className="text-black">
                    Todo
                  </option>

                  <option value="PRODUCT" className="text-black">
                    Productos
                  </option>

                  <option value="SERVICE" className="text-black">
                    Servicios
                  </option>
                </select>

                {/* Precio mínimo */}
                <input
                  type="number"
                  placeholder="Precio min"
                  value={formState.minPrice}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      minPrice:
                        e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className="
        h-12 w-[140px]
        px-4 rounded-2xl
        bg-white/10 backdrop-blur-xl
        border border-white/15
        text-white placeholder:text-white/50
        outline-none
      "
                />

                {/* Precio máximo */}
                <input
                  type="number"
                  placeholder="Precio max"
                  value={formState.maxPrice}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      maxPrice:
                        e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className="
        h-12 w-[140px]
        px-4 rounded-2xl
        bg-white/10 backdrop-blur-xl
        border border-white/15
        text-white placeholder:text-white/50
        outline-none
      "
                />

                {/* Orden */}
                <select
                  value={formState.sort}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      sort: e.target.value,
                    }))
                  }
                  className="
        h-12 px-4 rounded-2xl
        bg-white/10 backdrop-blur-xl
        border border-white/15
        text-white
        outline-none
      "
                >
                  <option value="" className="text-black">
                    Ordenar
                  </option>

                  <option value="az" className="text-black">
                    A-Z
                  </option>

                  <option value="za" className="text-black">
                    Z-A
                  </option>

                  <option value="priceLow" className="text-black">
                    Más baratos
                  </option>

                  <option value="priceHigh" className="text-black">
                    Más caros
                  </option>
                </select>
              </div>

              {/* CHIPS */}
              <div className="flex flex-wrap gap-3">
                {/* Disponible */}
                <button
                  onClick={() =>
                    setFormState((prev) => ({
                      ...prev,
                      onlyAvailable: !prev.onlyAvailable,
                    }))
                  }
                  className={`
        px-5 py-2.5 rounded-full
        text-sm font-medium
        transition-all duration-300
        border shadow-md

        ${
          formState.onlyAvailable
            ? "bg-green-500 border-green-400 text-white"
            : "bg-white/10 border-white/15 text-white"
        }
      `}
                >
                  🚚 Disponibles fuera
                </button>

                {/* Productos */}
                <button
                  onClick={() =>
                    setFormState((prev) => ({
                      ...prev,
                      onlyProducts: !prev.onlyProducts,
                    }))
                  }
                  className={`
        px-5 py-2.5 rounded-full
        text-sm font-medium
        transition-all duration-300
        border shadow-md

        ${
          formState.onlyProducts
            ? "bg-orange-500 border-orange-400 text-white"
            : "bg-white/10 border-white/15 text-white"
        }
      `}
                >
                  📦 Con productos
                </button>

                {/* Redes */}
                <button
                  onClick={() =>
                    setFormState((prev) => ({
                      ...prev,
                      onlyWithSocials: !prev.onlyWithSocials,
                    }))
                  }
                  className={`
        px-5 py-2.5 rounded-full
        text-sm font-medium
        transition-all duration-300
        border shadow-md

        ${
          formState.onlyWithSocials
            ? "bg-pink-500 border-pink-400 text-white"
            : "bg-white/10 border-white/15 text-white"
        }
      `}
                >
                  📱 Con redes
                </button>
              </div>

              {/* DÍAS */}
              <div className="flex flex-wrap gap-2">
                {[
                  "lunes",
                  "martes",
                  "miercoles",
                  "jueves",
                  "viernes",
                  "sabado",
                  "domingo",
                ].map((day) => (
                  <button
                    key={day}
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        workDay: prev.workDay === day ? "" : day,
                      }))
                    }
                    className={`
          px-4 py-2 rounded-2xl
          text-sm capitalize
          border transition-all duration-300

          ${
            formState.workDay === day
              ? "bg-white text-cyan-900 border-white"
              : "bg-white/10 text-white border-white/15"
          }
        `}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {filteredData.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <MessageNotData />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full mt-6">
            {filteredData.map((e) => {
              const infodata = e.files.map((file) =>
                typeof file === "string" ? file : file.filename,
              );

              const productsForCard: AddProduct[] = e.products.map(
                (p: AdvProduct) => ({
                  ...p,
                  files: p.files.map((f) =>
                    typeof f === "string" ? f : f.filename,
                  ),
                }),
              );

              return (
                <Cardinfo
                  key={e.id}
                  products={productsForCard}
                  images={infodata}
                  codigo={e.codigo}
                  workDays={e.workDays}
                  openingHour={e.openingHour}
                  closingHour={e.closingHour}
                  facebookred={String(e.facebookred)}
                  instagramred={String(e.instagramred)}
                  tiktokred={String(e.tiktokred)}
                  xred={String(e.xred)}
                  youtubered={String(e.youtubered)}
                  phone={e.phone}
                  email={e.email}
                  description={e.description}
                  name={e.name}
                  profession={e.profession}
                  nameUnit={e.nameUnit}
                  webPage={e.webPage}
                />
              );
            })}
          </div>
        )}
      </div>

      {showCart && (
        <aside
          className={`
            fixed inset-x-0 bottom-0 z-50
            w-full 
            h-auto
            flex flex-col
            bg-gradient-to-b from-white to-gray-50/95
            border-t border-gray-200
            rounded-t-3xl
            shadow-[0_-10px_40px_rgba(0,0,0,0.15)]
            p-5
            backdrop-blur-xl
            transition-all duration-300

            lg:sticky lg:top-5 lg:w-[340px] lg:h-fit
            lg:rounded-3xl lg:border lg:border-gray-200
            lg:shadow-[0_10px_40px_rgba(0,0,0,0.08)]
          `}
        >
          {" "}
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <Text font="bold" size="lg" className="text-gray-900">
                Tus pedidos
              </Text>

              <Text size="sm" className="text-gray-500 mt-1">
                Resumen de tu compra
              </Text>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center shadow-inner">
              🛒
            </div>
          </div>
          {/* Payment */}
          <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
            <FormPayment />
          </div>
          {/* Empty */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-4">
                🛍️
              </div>

              <Text className="text-gray-700 font-semibold">
                Tu carrito está vacío
              </Text>

              <Text size="sm" className="text-gray-500 mt-2 max-w-[220px]">
                Agrega productos para ver el resumen aquí
              </Text>
            </div>
          ) : (
            <>
              {/* Products */}
              <div className="mt-5 space-y-4 overflow-y-auto max-h-[50vh] pr-1 custom-scroll">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-lg">
                        📦
                      </div>

                      <div>
                        <Text
                          font="bold"
                          className="text-gray-800 line-clamp-1"
                        >
                          {item.name}
                        </Text>

                        <Text size="sm" className="text-gray-500 mt-1">
                          Cantidad: {item.quantity}
                        </Text>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <Text className="font-bold text-gray-900">
                        ${item.subtotal.toLocaleString()}
                      </Text>

                      <button
                        onClick={() => removeProduct(item.id)}
                        className="text-red-500 text-xs mt-2 opacity-70 hover:opacity-100 hover:text-red-600 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="text-gray-500 text-sm">Total a pagar</Text>

                    <Text font="bold" size="lg" className="text-gray-900">
                      ${total().toLocaleString()}
                    </Text>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">
                    💳
                  </div>
                </div>

                <button className="w-full mt-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl py-3.5 font-semibold shadow-lg shadow-orange-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                  Pedir todos
                </button>
              </div>
            </>
          )}
        </aside>
      )}
    </div>
  );
}
