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

  // ✅ STORE
  const { items, removeProduct, total } = useCartStore();

  return (
    <div className="flex gap-4">
      <div className={`transition-all ${showCart ? "w-3/4" : "w-full"}`}>
        <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl">
          <div className="flex justify-between items-center p-4">
            <Text className="text-white" font="bold" size="lg">
              Encuentra el mejor producto o servicio dentro de tu comunidad
            </Text>

            {/* CARRITO */}
            <button
              onClick={() => setShowCart((prev) => !prev)}
              className="relative text-white"
            >
              <MdLocalGroceryStore size={30} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-xs px-2 rounded-full">
                  {items.length}
                </span>
              )}
            </button>
          </div>

          <div className="p-2">
            <InputField
              placeholder="Buscar"
              rounded="lg"
              value={formState.search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormState((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
        </section>

        {filteredData.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <MessageNotData />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 w-full mt-4">
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

      {/* ================= PANEL DERECHO (VENTANA EMERGENTE) ================= */}
      {showCart && (
        <aside className="w-1/4 bg-white border rounded-xl shadow-md p-4 h-[calc(100vh-40px)] sticky top-5">
          <Text font="bold" size="lg">
            Tus pedidos
          </Text>
          <FormPayment />

          {items.length === 0 ? (
            <Text className="text-gray-500 mt-4">
              No hay productos en el carrito
            </Text>
          ) : (
            <div className="mt-4 space-y-3 overflow-auto max-h-[65vh]">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <Text font="bold">{item.name}</Text>
                    <Text size="sm" className="text-gray-500">
                      Cantidad: {item.quantity}
                    </Text>
                  </div>

                  <div className="text-right">
                    <Text>${item.subtotal.toLocaleString()}</Text>
                    <button
                      onClick={() => removeProduct(item.id)}
                      className="text-red-500 text-xs mt-1"
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
              <div className="flex justify-between font-bold mt-4">
                <Text>Total</Text>
                <Text>${total().toLocaleString()}</Text>
              </div>

              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3 font-semibold mt-4">
                Pedir todos
              </button>
            </>
          )}
        </aside>
      )}
    </div>
  );
}
