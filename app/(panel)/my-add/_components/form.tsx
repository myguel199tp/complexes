"use client";
import { Buton, InputField, Text } from "complexes-next-components";
import React, { useRef, useState } from "react";
import { IoImages } from "react-icons/io5";

import Image from "next/image";
import useForm from "./use-form";

export default function Form() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    isSuccess,
  } = useForm();

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setValue("files", files, { shouldValidate: true });
      const urls = files.map((file) => URL.createObjectURL(file));
      setPreviews(urls);
    } else {
      setPreviews([]);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full p-6"
      >
        <section className="w-full flex flex-col md:!flex-row">
          <div className="w-full md:!w-[70%]">
            <InputField
              className="mt-2"
              {...register("name")}
              placeholder="nombre del negocio"
              hasError={!!errors.name}
              errorMessage={errors.name?.message}
            />
            <InputField
              className="mt-2"
              {...register("profession")}
              placeholder="Profesion a lo que se dedica"
              hasError={!!errors.profession}
              errorMessage={errors.profession?.message}
            />
            <InputField
              className="mt-2"
              {...register("webPage")}
              placeholder="pagina web"
              hasError={!!errors.webPage}
              errorMessage={errors.webPage?.message}
            />
            <textarea
              placeholder="Agregar el mensaje"
              className="mt-2 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="ml-2 block">
            {previews.length === 0 && (
              <>
                <IoImages
                  size={150}
                  onClick={handleIconClick}
                  className="cursor-pointer"
                />
                <div className="flex justify-center items-center">
                  <Text size="sm">solo archivos png - jpg</Text>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}

            {previews.length > 0 && (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-2 mt-2">
                {previews.map((src, index) => (
                  <div
                    key={index}
                    className="group w-fit rounded-md overflow-hidden"
                  >
                    <Image
                      src={src}
                      width={200}
                      height={150}
                      alt={`Vista previa ${index}`}
                      className="w-full max-w-xs rounded-md border transition-transform duration-300 group-hover:scale-125"
                    />
                  </div>
                ))}
              </div>
            )}
            {previews.length > 0 && (
              <div className="flex mt-2 gap-4">
                <IoImages
                  size={50}
                  onClick={handleIconClick}
                  className="cursor-pointer"
                />
                <div className="flex justify-center items-center">
                  <Text size="sm">solo archivos png - jpg</Text>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>
        </section>
        <Buton
          colVariant="primary"
          size="full"
          rounded="md"
          borderWidth="semi"
          type="submit"
          className="mt-4"
          disabled={isSuccess}
        >
          <Text>Agregar anuncio</Text>
        </Buton>
      </form>
    </div>
  );
}
