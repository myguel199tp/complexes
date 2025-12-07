"use client";
import React, { useState } from "react";
import {
  Buton,
  Button,
  InputField,
  MultiSelect,
  SelectField,
  Text,
  TextAreaField,
} from "complexes-next-components";
import { IoImages } from "react-icons/io5";

import Image from "next/image";
import useForm from "./use-form";
import useAddFormInfo from "./addForm-info";
import { useTranslation } from "react-i18next";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";
import { phoneLengthByCountry } from "@/app/helpers/longitud-telefono";
import { Controller } from "react-hook-form";

export default function Form() {
  const { indicativeOptions } = useCountryCityOptions();
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    isSuccess,
    control,
  } = useForm();

  const { previews, setPreviews, handleIconClick, fileInputRef } =
    useAddFormInfo();

  const [showRed, setShowRed] = useState(false);

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
  const { t } = useTranslation();

  const [maxLengthCellphone, setMaxLengthCellphone] = useState<
    number | undefined
  >(undefined);

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
              regexType="alphanumeric"
              helpText="nombre del negocio"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              hasError={!!errors.name}
              errorMessage={errors.name?.message}
            />
            <InputField
              className="mt-2"
              regexType="letters"
              {...register("profession")}
              placeholder="Profesion a lo que se dedica"
              helpText="Profesion a lo que se dedica"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              hasError={!!errors.profession}
              errorMessage={errors.profession?.message}
            />

            <div className="mt-2">
              <SelectField
                tKeyDefaultOption={t("indicativo")}
                tKeyHelpText={t("indicativo")}
                searchable
                tkeySearch={t("buscarNoticia")}
                regexType="alphanumeric"
                defaultOption="Indicativo"
                helpText="Indicativo"
                sizeHelp="xs"
                id="indicative"
                options={indicativeOptions}
                inputSize="sm"
                rounded="md"
                {...register("indicative")}
                onChange={(e) => {
                  const selected = e.target.value;
                  setValue("indicative", selected, { shouldValidate: true });

                  const [, countryCode] = selected.split("-");
                  const maxLen =
                    phoneLengthByCountry[
                      countryCode as keyof typeof phoneLengthByCountry
                    ];

                  setMaxLengthCellphone(maxLen);
                }}
                tKeyError={t("idicativoRequerido")}
                hasError={!!errors.indicative}
                errorMessage={errors.indicative?.message}
              />
            </div>
            <div className="mt-2">
              <InputField
                required
                tKeyHelpText={t("celular")}
                regexType="phone"
                tKeyPlaceholder={t("celular")}
                placeholder="Celular"
                helpText="Celular"
                sizeHelp="xs"
                inputSize="sm"
                rounded="md"
                type="number"
                {...register("phone")}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (maxLengthCellphone)
                    value = value.slice(0, maxLengthCellphone);
                  setValue("phone", value, { shouldValidate: true });
                }}
                tKeyError={t("celularRequerido")}
                hasError={!!errors.phone}
                errorMessage={errors.phone?.message}
              />
            </div>
            <InputField
              className="mt-2"
              {...register("email")}
              placeholder="Correo electronico"
              helpText="Correo electronico"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
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
            <Text className="mt-4 font-semibold">Horario de Atención</Text>

            {/* Días de trabajo */}
            <Controller
              name="workDays"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  className="mt-2"
                  searchable
                  regexType="alphanumeric"
                  helpText="Días de trabajo"
                  sizeHelp="xs"
                  inputSize="full"
                  rounded="md"
                  defaultOption="Seleccionar días"
                  options={[
                    { label: "Lunes", value: "lunes" },
                    { label: "Martes", value: "martes" },
                    { label: "Miércoles", value: "miercoles" },
                    { label: "Jueves", value: "jueves" },
                    { label: "Viernes", value: "viernes" },
                    { label: "Sábado", value: "sabado" },
                    { label: "Domingo", value: "domingo" },
                  ]}
                  onChange={(values) => {
                    field.onChange(values);
                  }}
                  hasError={!!errors.workDays}
                  errorMessage={errors.workDays?.message}
                />
              )}
            />

            {/* Hora apertura */}
            <InputField
              className="mt-2"
              type="time"
              {...register("openingHour")}
              helpText="Hora de apertura"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              hasError={!!errors.openingHour}
              errorMessage={errors.openingHour?.message}
            />

            {/* Hora cierre */}
            <InputField
              className="mt-2"
              type="time"
              {...register("closingHour")}
              helpText="Hora de cierre"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              hasError={!!errors.closingHour}
              errorMessage={errors.closingHour?.message}
            />

            <Buton
              type="button"
              colVariant="default"
              borderWidth="none"
              rounded="lg"
              onClick={() => setShowRed(!showRed)}
            >
              Agregar pagina web y redes sociales del negocio
            </Buton>
            {showRed && (
              <div>
                <InputField
                  className="mt-2"
                  {...register("webPage", {
                    required: "La página web es obligatoria",
                    pattern: {
                      value: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i,
                      message: "Debe ser una URL válida",
                    },
                  })}
                  placeholder="pagina web"
                  helpText="pagina web"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="md"
                  hasError={!!errors.webPage}
                  errorMessage={errors.webPage?.message}
                />
                <InputField
                  className="mt-2"
                  regexType="url"
                  {...register("tiktokred")}
                  placeholder="Enlace de tiktok"
                  helpText="Enlace de tiktok"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="md"
                  hasError={!!errors.tiktokred}
                  errorMessage={errors.tiktokred?.message}
                />
                <InputField
                  className="mt-2"
                  regexType="url"
                  {...register("instagramred")}
                  placeholder="Enlace de instagram"
                  helpText="Enlace de instagram"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="md"
                  hasError={!!errors.instagramred}
                  errorMessage={errors.instagramred?.message}
                />
                <InputField
                  className="mt-2"
                  regexType="url"
                  {...register("facebookred")}
                  placeholder="Enlace de facebook"
                  helpText="Enlace de facebook"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="md"
                  hasError={!!errors.facebookred}
                  errorMessage={errors.facebookred?.message}
                />
                <InputField
                  className="mt-2"
                  regexType="url"
                  {...register("xred")}
                  placeholder="Enlace de X"
                  helpText="Enlace de X"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="md"
                  hasError={!!errors.xred}
                  errorMessage={errors.xred?.message}
                />
                <InputField
                  className="mt-2"
                  regexType="url"
                  {...register("youtubered")}
                  placeholder="Enlace de youtube"
                  helpText="Enlace de youtube"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="md"
                  hasError={!!errors.youtubered}
                  errorMessage={errors.youtubered?.message}
                />
              </div>
            )}
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
                  <Text size="sm" tKey={t("solo")}>
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
                  className="cursor-pointer text-gray-200"
                />
                <div className="flex justify-center items-center">
                  <Text className="text-gray-200" size="sm" tKey={t("solo")}>
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
