"use client";
import React, { useRef, useState } from "react";
import { Button, InputField, Text } from "complexes-next-components";

import "react-datepicker/dist/react-datepicker.css";
import { IoDocumentAttach } from "react-icons/io5";

import useForm from "./use-form";
import { useTranslation } from "react-i18next";
export default function Form() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { t } = useTranslation();
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
      const fileURL = URL.createObjectURL(file); // ← URL temporal para previsualizar
      setPreview(fileURL);
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
        <section className="w-full flex-col md:!flex-row ">
          <div className="w-full mb-4">
            <InputField
              placeholder={t("nombreDocumento")}
              helpText={t("nombreDocumento")}
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("title")}
              hasError={!!errors.title}
              errorMessage={errors.title?.message}
            />
            <div className="flex mt-4 md:!mb-0">
              <div className="flex items-center justify-center gap-1">
                <input
                  type="checkbox"
                  {...register("isPublic")}
                  className="w-6 h-6 bg-gray-200 border-gray-400 rounded-md cursor-pointer"
                />
                <Text size="sm" tKey={t("seleccionaDocumento")}>
                  Selecciona si el documento es público
                </Text>
              </div>
              {errors.isPublic && (
                <Text size="xs" colVariant="danger">
                  {errors.isPublic.message}
                </Text>
              )}
            </div>
          </div>
          <InputField
            className="mt-2"
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
          <div className="w-full md:!w-[60%] ml-2 justify-center items-center border-x-4 p-2">
            {!preview && (
              <div className="flex items-center justify-center">
                <IoDocumentAttach
                  size={350}
                  onClick={handleIconClick}
                  className="cursor-pointer text-gray-200"
                />
                <div className="flex justify-center items-center">
                  <Text size="sm"> solo archivo PDF </Text>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
            />

            {preview && (
              <div className="mt-3 flex flex-col items-center w-full">
                <iframe
                  src={preview}
                  width="100%"
                  height="400px"
                  className="border"
                  title="Previsualización PDF"
                />
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
              <Text size="xs" colVariant="danger">
                {errors.file.message}
              </Text>
            )}
          </div>
        </section>

        <Button
          colVariant="warning"
          size="full"
          rounded="md"
          tKey={t("registroDocuemnto")}
          type="submit"
          className="mt-4"
          disabled={isSuccess}
        >
          Registrar documento
        </Button>
      </form>
    </div>
  );
}
