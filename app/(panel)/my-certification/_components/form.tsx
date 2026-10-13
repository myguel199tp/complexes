"use client";
import React from "react";
import { Button, Text } from "complexes-next-components";

import "react-datepicker/dist/react-datepicker.css";
import { IoDocumentAttach } from "react-icons/io5";

import useForm from "./use-form";
import useFormInfo from "./form-info";
import { InputField } from "@/app/components/ui/form";
export default function Form() {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    isSuccess,
  } = useForm();

  const { fileInputRef, preview, setPreview, handleIconClick, t, language } =
    useFormInfo();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
      const fileURL = URL.createObjectURL(file);
      setPreview(fileURL);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="w-full" key={language}>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full p-2 sm:p-6"
      >
        <section className="w-full min-w-0 flex-col md:!flex-row bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
          <div className="w-full mb-4">
            <InputField
              placeholder={t("nombreDocumento")}
              helpText={t("nombreDocumento")}
              regexType="alphanumeric"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("title")}
              hasError={!!errors.title}
              errorMessage={errors.title?.message}
            />
            <div className="flex flex-col mt-4 md:!mb-0">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isPublic")}
                  className="mt-0.5 w-5 h-5 shrink-0 bg-gray-200 border-gray-400 rounded-md cursor-pointer"
                />
                <Text
                  size="sm"
                  font="bold"
                  className="min-w-0 break-words text-gray-800"
                  tKey={t("seleccionaDocumento")}
                >
                  Selecciona si el documento es público
                </Text>
              </label>
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
            {...register("conjuntoId")}
            hasError={!!errors.conjuntoId}
            errorMessage={errors.conjuntoId?.message}
          />
          <div className="w-full min-w-0 md:w-[52%] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300 p-4 sm:p-6 transition hover:border-cyan-500">
            {/*
              Icono y aviso apilados: lado a lado, el icono de 210 px no cabía en
              móvil y el texto quedaba encima de él.
            */}
            {!preview && (
              <button
                type="button"
                onClick={handleIconClick}
                className="group flex flex-col items-center justify-center gap-2 text-center"
              >
                <IoDocumentAttach className="h-24 w-24 sm:h-36 sm:w-36 md:h-44 md:w-44 text-gray-400 group-hover:text-cyan-600 transition" />
                <Text size="sm" colVariant="primary" className="text-blue-700">
                  Solo archivo PDF
                </Text>
              </button>
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
          colVariant="success"
          size="full"
          rounded="md"
          tKey={t("registroDocuemnto")}
          type="submit"
          className="mt-4 !py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
          disabled={isSuccess}
        >
          Registrar documento
        </Button>
      </form>
    </div>
  );
}
