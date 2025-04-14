"use client";
import React from "react";
import { InputField, Title } from "complexes-next-components";
import Summary from "./card-summary/summary";
import { useSearchParams } from "next/navigation";

export default function SummaryImmovables() {
  const searchParams = useSearchParams();
  const price = searchParams.get("price");
  const area = searchParams.get("area");
  const room = searchParams.get("room");
  const restroom = searchParams.get("restroom");
  const parking = searchParams.get("parking");
  const neighborhood = searchParams.get("neighborhood");
  const city = searchParams.get("city");
  const ofert = searchParams.get("ofert");
  const description = searchParams.get("description");
  const phone = searchParams.get("phone");
  const stratum = searchParams.get("stratum");
  const email = searchParams.get("email");
  const administration = searchParams.get("administration");
  const imagesParam = searchParams.get("images");
  const images = imagesParam ? JSON.parse(imagesParam) : [];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);

  return (
    <>
      <div className="flex justify-center">
        <div className="text-center bg-cyan-800 w-full rounded-md">
          <Title size="sm" font="bold" className="text-white">
            Apartamento en {ofert}
          </Title>
          <Title size="xs" font="semi" className="text-white">
            {neighborhood},{city}
          </Title>
        </div>
      </div>
      <Summary images={images} />
      <div>
        <InputField
          className="w-full"
          placeholder="Descripción del inmueble"
          value={String(description)}
          disabled
        />
      </div>
      <div className="flex justify-center gap-10 mt-3 p-4">
        <div>
          <InputField
            className="w-full mt-2"
            placeholder="Números de habitaiones"
            value={`${String(room)} Habitaciónes`}
            disabled
          />
          <InputField
            className="w-full mt-2"
            placeholder="Números de Baños"
            value={`${String(restroom)} Baños`}
            disabled
          />
          <InputField
            className="w-full mt-2"
            placeholder="Parqueaderos"
            value={`${String(parking)} parqueos`}
            disabled
          />
        </div>
        <div>
          <InputField
            className="w-full mt-2"
            placeholder="Estrato"
            value={` Estrato ${String(stratum)}`}
            disabled
          />
          <InputField
            className="w-full mt-2"
            placeholder="Area construida"
            value={`${String(area)}m2`}
            disabled
          />
          <InputField
            className="w-full mt-2"
            placeholder="Valor"
            value={formatCurrency(Number(price))}
            disabled
          />
        </div>
        <div>
          <InputField
            className="w-full mt-2"
            placeholder="Administracion"
            value={formatCurrency(Number(administration))}
            disabled
          />
          <InputField
            className="w-full mt-2"
            placeholder="Whatsapp"
            disabled
            value={String(phone)}
          />
          <InputField
            className="w-full mt-2"
            placeholder="Correo"
            disabled
            value={String(email)}
          />
        </div>
      </div>
    </>
  );
}
