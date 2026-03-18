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
        <aside className="hidden lg:flex lg:w-1/4 flex-col bg-white border rounded-xl shadow-lg p-5 h-[calc(100vh-40px)] sticky top-5">
          <Text font="bold" size="lg">
            Tus pedidos
          </Text>

          <div className="mt-2">
            <FormPayment />
          </div>

          {items.length === 0 ? (
            <Text className="text-gray-500 mt-6 text-center">
              No hay productos en el carrito
            </Text>
          ) : (
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[60vh] pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 flex justify-between items-center hover:shadow-sm transition"
                >
                  <div>
                    <Text font="bold">{item.name}</Text>

                    <Text size="sm" className="text-gray-500">
                      Cantidad: {item.quantity}
                    </Text>
                  </div>

                  <div className="text-right">
                    <Text className="font-semibold">
                      ${item.subtotal.toLocaleString()}
                    </Text>

                    <button
                      onClick={() => removeProduct(item.id)}
                      className="text-red-500 text-xs mt-1 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <>
              <div className="flex justify-between font-bold mt-6 border-t pt-4">
                <Text>Total</Text>
                <Text>${total().toLocaleString()}</Text>
              </div>

              <button className="w-full bg-orange-500 hover:bg-orange-600 transition text-white rounded-lg py-3 font-semibold mt-4 shadow">
                Pedir todos
              </button>
            </>
          )}
        </aside>
      )}
    </div>
  );
}
