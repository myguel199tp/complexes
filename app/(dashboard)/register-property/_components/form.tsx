"use client";
import {
  Button,
  InputField,
  SelectField,
  Title,
} from "complexes-next-components";
import React from "react";
import { FaImages } from "react-icons/fa";
import RegisterOptions from "./regsiter-options";
import { IoReturnUpBack } from "react-icons/io5";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";

export default function Form() {
  const router = useRouter();
  const options = [
    { value: "Bogotá", label: "Bogotá" },
    { value: "Medellin", label: "Medellin" },
    { value: "Cali", label: "Cali" },
  ];

  const { antiquitygOptions, parkingOptions, roomOptions, restrooomOptions } =
    RegisterOptions();

  return (
    <form>
      <div
        className="flex gap-2 items-center cursor-pointer"
        onClick={() => {
          router.push(route.profile);
        }}
      >
        <IoReturnUpBack size={50} />
        <Title size="md" className="m-4" font="semi" as="h2">
          Inmueble
        </Title>
      </div>
      <div className="flex gap-20 w-full justify-center">
        <div>
          <SelectField
            className="mt-2 w-60"
            defaultOption="Tipo de oferta"
            id="city"
            options={options}
            inputSize="lg"
            rounded="lg"
          />
          <SelectField
            className="mt-2 w-60"
            defaultOption="Tipo de inmueble"
            id="city"
            options={options}
            inputSize="lg"
            rounded="lg"
          />
          <SelectField
            className="mt-2 w-60"
            defaultOption="# de habitaciones"
            id="city"
            options={roomOptions}
            inputSize="lg"
            rounded="lg"
          />
          <SelectField
            className="mt-2 w-60"
            defaultOption="# de baños"
            id="city"
            options={restrooomOptions}
            inputSize="lg"
            rounded="lg"
          />
          <SelectField
            className="mt-2 w-60"
            defaultOption="Estrato"
            options={options}
            inputSize="lg"
            rounded="lg"
          />
          <SelectField
            className="mt-2 w-60"
            defaultOption="Antiguedad inmueble"
            id="city"
            options={antiquitygOptions}
            inputSize="lg"
            rounded="lg"
          />
          <SelectField
            className="mt-2 w-60"
            defaultOption="# de parqueaderos"
            id="city"
            options={parkingOptions}
            inputSize="lg"
            rounded="lg"
          />
        </div>
        <div>
          <InputField placeholder="ubicacion del inmueble" rounded="lg" />
          <div className="mt-4">
            <FaImages size={200} />
          </div>
        </div>
        <div>
          <InputField placeholder="Precio" rounded="lg" />
          <InputField
            placeholder="Valor administración"
            className="mt-2"
            rounded="lg"
          />
          <InputField
            placeholder="Área construida"
            className="mt-2"
            rounded="lg"
          />
          <InputField
            placeholder="Descripción del inmueble"
            className="mt-2"
            rounded="lg"
          />
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        <InputField
          placeholder="Nombre contacto"
          className="mt-2"
          rounded="lg"
        />
        <InputField placeholder="whatsapp" className="mt-2" rounded="lg" />
        <InputField
          placeholder="Correo electronico"
          className="mt-2"
          rounded="lg"
        />
      </div>
      <div className="flex justify-center mt-4">
        <div className="w-96">
          <Button size="full" rounded="lg">
            Registrar
          </Button>
        </div>
      </div>
    </form>
  );
}
