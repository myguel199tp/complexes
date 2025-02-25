"use client";
import { Buton, InputField, Title, Text } from "complexes-next-components";
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
      <Title size="md" className="m-4" font="semi" as="h2">
        Registrar Visitante
      </Title>
      <div className="w-full">
        <form
          onSubmit={onSubmit}
          className="flex flex-col justify-center items-center w-full"
        >
          <div className="flex flex-col gap-4 md:!flex-row justify-between  p-4">
            <section className="w-[50%]">
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
            </section>
            <div className="mt-3">
              <IoImages
                size={100}
                onClick={handleIconClick}
                className="cursor-pointer"
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              {preview && (
                <div className="mt-3">
                  <Image
                    src={preview}
                    width={200}
                    height={200}
                    alt="Vista previa"
                    className="w-full max-w-xs rounded-md border"
                  />
                </div>
              )}
              {errors.file && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.file.message}
                </p>
              )}
            </div>
          </div>

          <Buton
            colVariant="primary"
            size="full"
            rounded="md"
            borderWidth="semi"
            type="submit"
            className="mt-4"
            disabled={isSuccess}
          >
            <Text>Agregar Visitante</Text>
          </Buton>
        </form>
      </div>
    </div>
  );
}
