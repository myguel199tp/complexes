"use client";
import React from "react";
import {
  Button,
  InputField,
  Text,
  TextAreaField,
} from "complexes-next-components";
import { IoImages } from "react-icons/io5";

import Image from "next/image";
import useForm from "./use-form";
import useAddFormInfo from "./addForm-info";

export default function Form() {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    isSuccess,
  } = useForm();

  const { previews, setPreviews, handleIconClick, fileInputRef } =
    useAddFormInfo();

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
          <div className="w-full md:!w-[60%]">
            <InputField
              className="mt-2"
              {...register("name")}
              placeholder="nombre del negocio"
              helpText="nombre del negocio"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              hasError={!!errors.name}
              errorMessage={errors.name?.message}
            />
            <InputField
              className="mt-2"
              {...register("profession")}
              placeholder="Profesion a lo que se dedica"
              helpText="Profesion a lo que se dedica"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              hasError={!!errors.profession}
              errorMessage={errors.profession?.message}
            />
            <InputField
              className="mt-2"
              {...register("webPage")}
              placeholder="pagina web"
              helpText="pagina web"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              hasError={!!errors.webPage}
              errorMessage={errors.webPage?.message}
            />
            <InputField
              className="mt-2"
              {...register("phone")}
              placeholder="Celular"
              helpText="Celular"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              hasError={!!errors.phone}
              errorMessage={errors.phone?.message}
            />
            <InputField
              className="mt-2"
              {...register("email")}
              placeholder="Correo electronico"
              helpText="Correo electronico"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              hasError={!!errors.email}
              errorMessage={errors.email?.message}
            />
            <TextAreaField
              placeholder="Agregar el mensaje"
              className="bg-gray-200 mt-2"
              rows={4}
              {...register("description")}
              errorMessage={errors.description?.message}
            />
          </div>
          <div className="ml-2 block p-4 border-x-4 w-[40%]">
            {previews.length === 0 && (
              <>
                <IoImages
                  size={350}
                  onClick={handleIconClick}
                  className="cursor-pointer text-gray-200"
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
              <div className="max-h-72 border overflow-y-auto space-y-2 pr-2 mt-2">
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
                  <Text className="text-cyan-800" size="sm">
                    solo archivos png - jpg
                  </Text>
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
        <Button
          colVariant="warning"
          size="full"
          rounded="md"
          type="submit"
          className="mt-4"
          disabled={isSuccess}
        >
          <Text>Agregar anuncio</Text>
        </Button>
      </form>
    </div>
  );
}
