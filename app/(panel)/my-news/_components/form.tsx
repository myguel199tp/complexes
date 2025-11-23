"use client";
import {
  Button,
  InputField,
  Text,
  TextAreaField,
} from "complexes-next-components";
import React, { useRef, useState } from "react";
import { IoImages } from "react-icons/io5";
import useForm from "./use-form";

import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function Form() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
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
  const { t } = useTranslation();
  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full p-6"
      >
        <section className="w-full flex flex-col md:!flex-row my-8">
          <div className="w-full md:!w-[70%]">
            <InputField
              className="mt-2"
              regexType="alphanumeric"
              type="hidden"
              {...register("nameUnit")}
              hasError={!!errors.nameUnit}
              errorMessage={errors.nameUnit?.message}
            />
            <InputField
              className="mt-2"
              type="hidden"
              {...register("conjunto_id")}
              hasError={!!errors.conjunto_id}
              errorMessage={errors.conjunto_id?.message}
            />

            <InputField
              className="mt-2"
              type="hidden"
              {...register("mailAdmin")}
              hasError={!!errors.mailAdmin}
              errorMessage={errors.mailAdmin?.message}
            />
            <InputField
              placeholder={t("noticiaTitulo")}
              helpText={t("noticiaTitulo")}
              sizeHelp="xs"
              inputSize="full"
              rounded="md"
              regexType="alphanumeric"
              className="mt-2"
              type="text"
              {...register("title")}
              hasError={!!errors.title}
              errorMessage={errors.title?.message}
            />
            <TextAreaField
              placeholder={t("noticiaMensaje")}
              regexType="alphanumeric"
              className="mt-2 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={8}
              {...register("textmessage")}
            />
            {errors.textmessage && (
              <Text colVariant="danger" size="xs">
                {errors.textmessage.message}
              </Text>
            )}
          </div>
          <div className="w-full md:!w-[30%] ml-2 justify-center items-center border-x-4 p-2">
            {!preview && (
              <>
                <IoImages
                  onClick={handleIconClick}
                  className="w-1/2 h-auto max-w-[150px] text-gray-100 cursor-pointer"
                />
                <div className="justify-center items-center">
                  <Text size="md" colVariant="primary">
                    {" "}
                    {t("solo")}{" "}
                  </Text>
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
              <div className="mt-3">
                <Image
                  src={preview}
                  width={200}
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
            {errors.file && (
              <Text size="xs" colVariant="danger">
                {errors.file.message}
              </Text>
            )}
          </div>
        </section>
        <Button
          colVariant="warning"
          tKey={t("mynoticia")}
          translate="yes"
          size="full"
          rounded="md"
          type="submit"
          className="mt-4"
        >
          <Text>Agregar noticia</Text>
        </Button>
      </form>
    </div>
  );
}
