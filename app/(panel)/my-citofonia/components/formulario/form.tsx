"use client";
import { Buton, InputField, Text, Button } from "complexes-next-components";
import React, { useRef, useState } from "react";
import { IoImages } from "react-icons/io5";

import useForm from "./use-form";
import Image from "next/image";

export default function Form() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const {
    register,
    setValue,
    formState: { errors },
    onSubmit,
    isSuccess,
  } = useForm();
  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={onSubmit}
        className="flex flex-col justify-center items-center w-full p-6"
      >
        <section className="w-full flex flex-col md:!flex-row">
          <div className="w-full md:!w-[70%]">
            <InputField
              placeholder="nombre del visitante"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("namevisit")}
              hasError={!!errors.namevisit}
              errorMessage={errors.namevisit?.message}
            />
            <InputField
              placeholder="Número de identificación"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("numberId")}
              hasError={!!errors.numberId}
              errorMessage={errors.numberId?.message}
            />
            <InputField type="hidden" {...register("nameUnit")} />

            <InputField
              placeholder="Número de apartamento"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("apartment")}
              hasError={!!errors.apartment}
              errorMessage={errors.apartment?.message}
            />
            <InputField
              placeholder="Número de placa"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("plaque")}
              hasError={!!errors.plaque}
              errorMessage={errors.plaque?.message}
            />
          </div>
          <div className="w-full md:!w-[30%] mt-2 md!mt-0 ml-2 justify-center items-center border-x-4 border-cyan-800 p-2">
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
              onChange={handleFileChange}
            />
            {preview && (
              <div className="block">
                <div className="mt-3">
                  <Image
                    src={preview}
                    width={200}
                    height={200}
                    alt="Vista previa"
                    className="w-full max-w-xs rounded-md border"
                  />
                </div>
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
            {errors.file && (
              <p className="text-red-500 text-sm mt-1">{errors.file.message}</p>
            )}
          </div>
        </section>

        <Buton
          colVariant="primary"
          size="full"
          rounded="lg"
          borderWidth="semi"
          type="submit"
          className="mt-4"
          disabled={isSuccess}
        >
          <Text>Agregar Visitante</Text>
        </Buton>
      </form>
    </div>
  );
}
