"use client";
import React, { useRef, useState } from "react";
import { Buton, Button, InputField, Text } from "complexes-next-components";

import "react-datepicker/dist/react-datepicker.css";
import { IoDocumentAttach } from "react-icons/io5";

import useForm from "./use-form";

export default function Form() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

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
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
      setPreview(file.name); // guarda el nombre
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full p-6"
      >
        <section className="w-full ">
          <div className="w-full mb-4">
            <InputField
              placeholder="Nombre de documento"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("title")}
              hasError={!!errors.title}
              errorMessage={errors.title?.message}
            />
          </div>
          <InputField
            className="mt-2"
            type="hidden"
            {...register("conjunto_id")}
            hasError={!!errors.conjunto_id}
            errorMessage={errors.conjunto_id?.message}
          />
          <div className="w-full md:!w-[30%] ml-2 justify-center items-center border-x-4 border-cyan-800 p-2">
            {!preview && (
              <>
                <IoDocumentAttach
                  size={150}
                  onClick={handleIconClick}
                  className="cursor-pointer text-cyan-800"
                />
                <div className="flex justify-center items-center">
                  <Text size="sm"> solo archivo pdf </Text>
                </div>
              </>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="application/pdf" // ← aquí
              onChange={handleFileChange}
            />
            {preview && (
              <div className="mt-3 flex flex-col items-center">
                <IoDocumentAttach size={40} className="text-cyan-800" />{" "}
                {/* icono en lugar de <Image> */}
                <Text>{preview}</Text>
                <Button
                  className="p-2 mt-2"
                  colVariant="primary"
                  size="sm"
                  onClick={handleIconClick}
                >
                  Cargar otro PDF
                </Button>
              </div>
            )}
            {errors.file && (
              <Text size="xs" className="text-red-500 text-sm mt-1">
                {errors.file.message}
              </Text>
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
          <Text>Subir documento</Text>
        </Buton>
      </form>
    </div>
  );
}
