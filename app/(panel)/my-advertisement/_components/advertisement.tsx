"use client";

import React from "react";
import { Text, InputField } from "complexes-next-components";
import AdvertisementInfo from "./advertisement-info";
import Cardinfo from "./card-advertidement/card-info";
import { Product as AddProduct } from "@/app/(panel)/my-add/services/response/addResponse";
import { Product as AdvProduct } from "@/app/(panel)/my-advertisement/services/response/advertisementResponse";
import MessageNotData from "@/app/components/messageNotData";

export default function Advertisement() {
  const { filteredData, formState, setFormState } = AdvertisementInfo();

  return (
    <div>
      {/* Header + buscador */}
      <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-10 p-4">
          <Text className="text-white" font="bold" size="lg">
            Encuentra el mejor producto o servicio dentro de tu comunidad
          </Text>
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

      {/* Contenido */}
      {filteredData.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 w-full mt-4">
          {filteredData.map((e) => {
            const infodata = e.files.map((file) =>
              typeof file === "string" ? file : file.filename
            );

            const productsForCard: AddProduct[] = e.products.map(
              (p: AdvProduct) => ({
                ...p,
                files: p.files.map((f) =>
                  typeof f === "string" ? f : f.filename
                ),
              })
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
  );
}
