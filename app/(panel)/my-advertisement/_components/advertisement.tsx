"use client";

import React, { useState } from "react";
import { Text, InputField } from "complexes-next-components";
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

  const { items, removeProduct, total } = useCartStore();

  return (
    <div className="flex gap-6 max-w-[1600px] mx-auto px-4">
      <div
        className={`transition-all duration-300 ${
          showCart ? "w-full lg:w-3/4" : "w-full"
        }`}
      >
        <section className="sticky top-0 z-20 bg-gradient-to-r from-cyan-700 to-cyan-900 rounded-xl shadow-md">
          <div className="flex justify-between items-center p-4">
            <Text className="text-white" font="bold" size="lg">
              Encuentra productos y servicios dentro de tu comunidad
            </Text>

            <button
              onClick={() => setShowCart((prev) => !prev)}
              className="relative flex items-center justify-center bg-white/10 hover:bg-white/20 transition rounded-full p-3"
            >
              <MdLocalGroceryStore size={26} className="text-white" />

              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-semibold px-2 py-[2px] rounded-full shadow">
                  {items.length}
                </span>
              )}
            </button>
          </div>

          <div className="px-4 pb-4">
            <InputField
              placeholder="Buscar producto o servicio..."
              rounded="lg"
              value={formState.search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormState((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
        </section>

        {filteredData.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <MessageNotData />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full mt-6">
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
            w-full max-h-[85vh]
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
          <div className="flex items-center justify-between mb-5">
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
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
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
