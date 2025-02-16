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
      <Title font="bold">Crear noticia</Title>
      <form
        onSubmit={onSubmit}
        className="flex flex-col justify-center items-center w-full"
      >
        <div className="w-full">
          <InputField type="hidden" {...register("nameUnit")} />
          <InputField type="hidden" {...register("mailAdmin")} />
          <InputField
            placeholder="Título de la noticia"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("title")}
            hasError={!!errors.title}
            errorMessage={errors.title?.message}
          />
          <InputField
            placeholder="Agregar el mensaje"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("textmessage")}
            hasError={!!errors.textmessage}
            errorMessage={errors.textmessage?.message}
          />
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
              <p className="text-red-500 text-sm mt-1">{errors.file.message}</p>
            )}
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
            <Text>Agregar noticia</Text>
          </Buton>
        </div>
      </form>
    </div>
  );
}
