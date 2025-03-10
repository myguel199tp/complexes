"use client";
import {
  Buton,
  Button,
  InputField,
  SelectField,
  Text,
} from "complexes-next-components";
import React, { useRef, useState } from "react";
import RegisterOptions from "./regsiter-options";
import { IoImages } from "react-icons/io5";

import Image from "next/image";

export default function Form() {
  const options = [
    { value: "Bogotá", label: "Bogotá" },
    { value: "Medellin", label: "Medellin" },
    { value: "Cali", label: "Cali" },
  ];

  const { antiquitygOptions, parkingOptions, roomOptions, restrooomOptions } =
    RegisterOptions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setValue("file", file, { shouldValidate: true });
  //     const fileUrl = URL.createObjectURL(file);
  //     setPreview(fileUrl);
  //   } else {
  //     setPreview(null);
  //   }
  // };

  return (
    <form className="mt-1">
      <section className="flex flex-col gap-4 md:!flex-row justify-between">
        <div className="w-[45%]">
          <SelectField
            className="mt-2"
            defaultOption="Tipo de oferta"
            id="city"
            options={options}
            inputSize="lg"
            rounded="md"
          />
          <SelectField
            className="mt-2"
            defaultOption="Tipo de inmueble"
            id="city"
            options={options}
            inputSize="lg"
            rounded="md"
          />
          <SelectField
            className="mt-2"
            defaultOption="# de habitaciones"
            id="city"
            options={roomOptions}
            inputSize="lg"
            rounded="md"
          />
          <SelectField
            className="mt-2"
            defaultOption="# de baños"
            id="city"
            options={restrooomOptions}
            inputSize="lg"
            rounded="md"
          />
          <SelectField
            className="mt-2"
            defaultOption="Estrato"
            options={options}
            inputSize="lg"
            rounded="md"
          />
          <SelectField
            className="mt-2"
            defaultOption="Antiguedad inmueble"
            id="city"
            options={antiquitygOptions}
            inputSize="lg"
            rounded="md"
          />
          <SelectField
            className="mt-2"
            defaultOption="# de parqueaderos"
            id="city"
            options={parkingOptions}
            inputSize="lg"
            rounded="md"
          />
        </div>
        <div className="w-[30%] border-x-4 border-cyan-800 p-2">
          {!preview && (
            <>
              <IoImages
                size={150}
                onClick={handleIconClick}
                className="cursor-pointer"
              />
              <div className="flex justify-center items-center">
                <Text size="sm"> solo archivos png - jpg </Text>
              </div>
            </>
          )}

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={() => setPreview(preview)}
            // onChange={handleFileChange}
          />
          {preview && (
            <div className="mt-3">
              <Image
                src={preview}
                width={300}
                height={130}
                alt="Vista previa"
                className="w-full max-w-xs rounded-md border"
              />
              <Button
                className="p-2"
                colVariant="primary"
                size="sm"
                onClick={handleIconClick}
              >
                Cargar otra
              </Button>
            </div>
          )}
          {/* {errors.file && (
            <p className="text-red-500 text-sm mt-1">{errors.file.message}</p>
          )} */}
        </div>
        <div className="w-[45%]">
          <InputField placeholder="Precio" rounded="md" />
          <InputField
            placeholder="Valor administración"
            className="mt-2"
            rounded="md"
          />
          <InputField
            placeholder="Área construida"
            className="mt-2"
            rounded="md"
          />
          <InputField
            placeholder="Descripción del inmueble"
            className="mt-2"
            rounded="md"
          />
          <InputField
            placeholder="Nombre contacto"
            className="mt-2"
            rounded="md"
          />
          <InputField placeholder="whatsapp" className="mt-2" rounded="md" />
          <InputField
            placeholder="Correo electronico"
            className="mt-2"
            rounded="md"
          />
        </div>
      </section>
      <Buton size="full" rounded="md" className="mt-2">
        Registrar esto
      </Buton>
    </form>
  );
}
