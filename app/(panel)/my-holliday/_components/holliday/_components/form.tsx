"use client";
import { Buton, Button, InputField, Text } from "complexes-next-components";
import React, { useRef, useState } from "react";
import { IoImages } from "react-icons/io5";

import Image from "next/image";

export default function Form() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  return (
    <form className="mt-1">
      <section className="flex flex-col gap-4 md:!flex-row justify-between">
        <div className="w-[45%]">
          <InputField placeholder="Nombre" className="mt-2" rounded="md" />
          <InputField placeholder="País" className="mt-2" rounded="md" />
          <InputField placeholder="Ciudad" className="mt-2" rounded="md" />
          <InputField
            placeholder="sector o barrio"
            className="mt-2"
            rounded="md"
          />
          <InputField placeholder="dirección" className="mt-2" rounded="md" />
          <InputField placeholder="Parquedero" className="mt-2" rounded="md" />
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
          <InputField
            placeholder="Precio por noche"
            className="mt-2"
            rounded="md"
          />
          <InputField
            placeholder="Descripcion o observaciones"
            className="mt-2"
            rounded="md"
          />
          <InputField placeholder="Mascotas" className="mt-2" rounded="md" />
          <InputField
            placeholder="Reglas de hogar"
            className="mt-2"
            rounded="md"
          />
          <InputField placeholder="Estado" className="mt-2" rounded="md" />
          <InputField
            placeholder="Cantidad maxima"
            className="mt-2"
            rounded="md"
          />
        </div>
      </section>
      <Buton
        colVariant="primary"
        size="full"
        rounded="md"
        borderWidth="semi"
        className="mt-4"
        type="submit"
      >
        <Text>Reserva vacacional</Text>
      </Buton>
    </form>
  );
}
