"use client";
import {
  Button,
  InputField,
  SelectField,
  Tooltip,
  Text,
  MultiSelect,
} from "complexes-next-components";
import React, { useRef, useState } from "react";
import { IoImages } from "react-icons/io5";
import useForm from "./use-form";

import Image from "next/image";
import { useRegisterStore } from "../store/registerStore";
import { useCountryCityOptions } from "../register-option";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";

export default function FormConjunto() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    control,
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

  const {
    countryOptions,
    cityOptions,
    indicativeOptions,
    PropertyOptions,
    setSelectedCountryId,
  } = useCountryCityOptions();

  const {
    setCityConjunto,
    setCountryConjunto,
    setNameConjunto,
    setNitConjunto,
    setAddressConjunto,
    setNeigBoorConjunto,
  } = useRegisterStore();

  const { t } = useTranslation();

  return (
    <div className="border-2 p-5 rounded-md mt-3 w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full p-6"
      >
        <section className="w-full flex flex-col md:!flex-row">
          <div className="w-full md:!w-[70%]">
            <div>
              <InputField
                tKeyHelpText={t("nombreUnidad")}
                tKeyPlaceholder={t("nombreUnidad")}
                placeholder="Nombre unidad residencial"
                helpText="Nombre unidad residencial"
                sizeHelp="sm"
                inputSize="full"
                rounded="md"
                type="text"
                {...register("name")}
                onChange={(e) => {
                  setValue("name", e.target.value, { shouldValidate: true });
                  setNameConjunto(e.target.value); // Aquí actualizas Zustand
                }}
                tKeyError={t("nombreunidadRequerido")}
                hasError={!!errors.name}
                errorMessage={errors.name?.message}
              />
              <div className="mt-2">
                <Controller
                  name="typeProperty"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      id="typeProperty"
                      searchable
                      defaultOption="Tipo de vivienda"
                      helpText="Tipo de propiedad"
                      sizeHelp="sm"
                      options={PropertyOptions}
                      inputSize="lg"
                      rounded="md"
                      disabled={false}
                      onChange={field.onChange} // RHF recibe el array string[]
                      hasError={!!errors.typeProperty}
                      errorMessage={errors.typeProperty?.message}
                    />
                  )}
                />
              </div>
            </div>
            <InputField
              placeholder="NIT, RUT, CUIT, RFC, CNPJ, RUC, EIN , IRS"
              className="mt-2"
              helpText={t("identficacion")}
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              type="text"
              {...register("nit")}
              onChange={(e) => {
                setValue("nit", e.target.value, { shouldValidate: true });
                setNitConjunto(e.target.value); // Aquí actualizas Zustand
              }}
              tKeyError={t("documentounidadRequerido")}
              hasError={!!errors.nit}
              errorMessage={errors.nit?.message}
            />
            <div className="mt-2 block md:!flex gap-4 w-full">
              <div className="w-full md:w-[50%] md:mt-2">
                <SelectField
                  tKeyDefaultOption={t("seleccionpais")}
                  tKeyHelpText={t("seleccionpais")}
                  searchable
                  defaultOption="Selecciona tu país"
                  helpText="Selecciona tu país"
                  sizeHelp="sm"
                  id="country"
                  options={countryOptions}
                  inputSize="lg"
                  rounded="md"
                  {...register("country")}
                  onChange={(e) => {
                    setSelectedCountryId(e.target.value || null);
                    setValue("country", e.target.value, {
                      shouldValidate: true,
                    });
                    setCountryConjunto(e.target.value); // Aquí actualizas Zustand
                  }}
                  tKeyError={t("paisRequerido")}
                  hasError={!!errors.country}
                  errorMessage={errors.country?.message}
                />
              </div>
              <div className="w-full md:w-[50%] md:mt-2">
                <SelectField
                  id="city"
                  required={true}
                  tKeyDefaultOption={t("seleccionaciudad")}
                  tKeyHelpText={t("seleccionaciudad")}
                  searchable
                  defaultOption="Selecciona tu ciudad"
                  helpText="Selecciona tu ciudad"
                  sizeHelp="sm"
                  options={cityOptions}
                  inputSize="lg"
                  rounded="md"
                  {...register("city")}
                  onChange={(e) => {
                    setValue("city", e.target?.value || "", {
                      shouldValidate: true,
                    });
                    setCityConjunto(e.target?.value || "");
                  }}
                  tKeyError={t("ciudadRequerido")}
                  hasError={!!errors.city}
                  errorMessage={errors.city?.message}
                />
              </div>
            </div>

            <InputField
              tKeyHelpText={t("sector")}
              tKeyPlaceholder={t("sector")}
              placeholder="Barrio o sector"
              helpText="Barrio o sector"
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("neighborhood")}
              onChange={(e) => {
                setValue("neighborhood", e.target.value, {
                  shouldValidate: true,
                });
                setNeigBoorConjunto(e.target.value);
              }}
              tKeyError={t("sectorRequerido")}
              hasError={!!errors.neighborhood}
              errorMessage={errors.neighborhood?.message}
            />

            <InputField
              tKeyHelpText={t("direccion")}
              tKeyPlaceholder={t("direccion")}
              placeholder="Dirección"
              helpText="Dirección"
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("address")}
              onChange={(e) => {
                setValue("address", e.target.value, { shouldValidate: true });
                setAddressConjunto(e.target.value);
              }}
              tKeyError={t("direccionRequerido")}
              hasError={!!errors.address}
              errorMessage={errors.address?.message}
            />

            <div className="flex items-center gap-3 mt-2">
              <SelectField
                tKeyDefaultOption={t("indicativo")}
                tKeyHelpText={t("indicativo")}
                searchable
                defaultOption="Indicativo"
                helpText="Indicativo"
                sizeHelp="sm"
                id="indicative"
                options={indicativeOptions}
                inputSize="lg"
                rounded="md"
                {...register("indicative")}
                onChange={(e) => {
                  setValue("indicative", e.target.value, {
                    shouldValidate: true,
                  });
                }}
                tKeyError={t("idicativoRequerido")}
                hasError={!!errors.indicative}
                errorMessage={errors.indicative?.message}
              />
              <InputField
                required
                tKeyHelpText={t("celular")}
                tKeyPlaceholder={t("celular")}
                placeholder="Celular"
                helpText="Celular"
                sizeHelp="sm"
                inputSize="full"
                rounded="md"
                type="text"
                {...register("cellphone")}
                tKeyError={t("celularRequerido")}
                hasError={!!errors.cellphone}
                errorMessage={errors.cellphone?.message}
              />
            </div>
          </div>
          <div className="w-full md:!w-[30%] ml-2 justify-cente items-center border-x-4 border-gray-300 p-2">
            {!preview && (
              <>
                <IoImages
                  onClick={handleIconClick}
                  className="cursor-pointer text-gray-300 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto"
                />
                <div className="justify-center items-center">
                  <Text size="md" tKey={t("logoImagen")}>
                    Imagen del conjunto
                  </Text>
                  <Text colVariant="primary" size="md" tKey={t("solo")}>
                    solo archivos png - jpg
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
                  width={600}
                  height={500}
                  alt="Vista previa"
                  className="w-full rounded-md border"
                />
                <div className="flex gap-6">
                  <Tooltip
                    content="Cargar otra"
                    position="right"
                    className="bg-gray-200 w-28"
                    tKey={t("cargarOtra")}
                  >
                    <IoImages
                      size={60}
                      onClick={handleIconClick}
                      className="cursor-pointer text-gray-200 hover:text-cyan-800"
                    />
                  </Tooltip>
                  <div className="justify-center items-center">
                    <Text size="md" tKey={t("logoImagen")}>
                      Imagen del conjunto
                    </Text>
                    <Text colVariant="primary" size="md" tKey={t("solo")}>
                      solo archivos png - jpg
                    </Text>
                  </div>
                </div>
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
          tKey={t("inscripcion")}
          size="full"
          rounded="md"
          type="submit"
          className="mt-4"
        >
          Agregar Conjunto
        </Button>
      </form>
    </div>
  );
}
