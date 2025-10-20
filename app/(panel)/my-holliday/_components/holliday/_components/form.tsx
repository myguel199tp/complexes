"use client";
import {
  Button,
  InputField,
  MultiSelect,
  SelectField,
  Text,
} from "complexes-next-components";
import React, { useEffect, useRef, useState } from "react";
import { IoClose, IoImages } from "react-icons/io5";

import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import useForm from "./use-form";
import { useCountryCityOptions } from "@/app/(dashboard)/registers/_components/register-option";
import RegisterOptions from "./register-options";
import { Controller, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export default function Form() {
  const { PropertyOptions, amenitiesOptions } = RegisterOptions();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const {
    countryOptions,
    indicativeOptions,
    cityOptions,
    setSelectedCountryId,
    currencyOptions,
  } = useCountryCityOptions();
  const [roominginup, setRoominginup] = useState(false);
  const [statusup, setStatusup] = useState(false);
  const address = useConjuntoStore((state) => state.address || "");
  const city = useConjuntoStore((state) => state.city || "");
  const country = useConjuntoStore((state) => state.country || "");
  const neigborhood = useConjuntoStore((state) => state.neighborhood || "");
  const {
    register,
    setValue,
    watch,
    formState: { errors },
    handleSubmit,
    control,
  } = useForm({ roominginup, statusup, address, city, country, neigborhood });

  const [files, setFiles] = useState<File[]>([]);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [videoType, setVideoType] = useState<"upload" | "youtube" | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length) {
      const newFiles = [...files, ...selectedFiles];
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setFiles(newFiles);
      setPreviews(newPreviews);
      setValue("files", newFiles, { shouldValidate: true });
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    setValue("files", updatedFiles, { shouldValidate: true });
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "bedRooms",
  });

  useEffect(() => {
    if (roominginup) {
      setValue("country", country || "");
      setValue("city", city || "");
      setValue("address", address || "");
      setValue("neigborhood", neigborhood || "");
    } else {
      setValue("country", "");
      setValue("city", "");
      setValue("address", "");
      setValue("neigborhood", "");
    }
  }, [roominginup, country, setValue, city, address, neigborhood]);

  const { t } = useTranslation();

  return (
    <form onSubmit={handleSubmit}>
      <section className="flex flex-col gap-4 md:!flex-row justify-between">
        <div className="w-full md:!w-[30%]">
          <div className="flex mt-2 mb-4 md:!mb-0 border rounded-md p-4">
            <div className="flex items-center justify-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("roomingin")}
                  onChange={(e) => setRoominginup(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:bg-blue-600 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
              </label>
              <Text size="md" tKey={t("conjutos")} translate="yes">
                Activar si el alojamiento pertenece al conjunto y al inmueble
                desde donde se está registrando
              </Text>
            </div>
            {errors.roomingin && (
              <Text size="xs" colVariant="danger">
                {errors.roomingin.message}
              </Text>
            )}
          </div>
          {!roominginup && (
            <div className="flex mt-2 mb-4 md:!mb-0 border rounded-md p-4">
              <div className="flex items-center justify-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("status")}
                    onChange={(e) => setStatusup(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:bg-blue-600 transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
                </label>
                <Text size="md" tKey={t("intoConjunto")} translate="yes">
                  Activar si el alojamiento se encuentra dentro de un conjunto
                  residencial, edificio o unidad cerrada
                </Text>
              </div>
              {errors.status && (
                <Text size="sm" colVariant="danger">
                  {errors.status.message}
                </Text>
              )}
            </div>
          )}
          <Controller
            name="property"
            control={control}
            rules={{ required: "El tipo de inmueble es obligatorio" }}
            render={({ field }) => (
              <SelectField
                tKeyHelpText={t("tipoInmueble")}
                tKeyDefaultOption={t("tipoInmueble")}
                searchable
                defaultOption="Tipo de inmueble"
                helpText="Tipo de inmueble"
                sizeHelp="sm"
                id="property"
                options={PropertyOptions}
                inputSize="lg"
                rounded="md"
                hasError={!!errors.property}
                errorMessage={errors.property?.message}
                {...field}
              />
            )}
          />
          <InputField
            tKeyHelpText={t("descripcionInmueble")}
            tKeyPlaceholder={t("descripcionInmueble")}
            placeholder="Descripción inmueble"
            helpText="Descripción inmueble"
            sizeHelp="sm"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("name")}
            hasError={!!errors.name}
            errorMessage={errors.name?.message}
          />
          <div className="mt-2">
            {!roominginup && (
              <SelectField
                searchable
                tKeyHelpText={t("seleccionpais")}
                tKeyDefaultOption={t("seleccionpais")}
                defaultOption="Pais"
                helpText="Pais"
                sizeHelp="sm"
                id="ofert"
                options={countryOptions}
                inputSize="lg"
                rounded="md"
                defaultValue={roominginup ? country || "" : ""}
                {...register("country")}
                onChange={(e) => {
                  setSelectedCountryId(e.target.value || null);
                  setValue("country", e.target.value, { shouldValidate: true });
                }}
                hasError={!!errors.country}
                errorMessage={errors.country?.message}
              />
            )}
          </div>
          {!roominginup && (
            <div className="mt-2">
              <SelectField
                searchable
                tKeyHelpText={t("seleccionaciudad")}
                tKeyDefaultOption={t("seleccionaciudad")}
                defaultOption="Ciudad"
                helpText="ciudad"
                sizeHelp="sm"
                id="ofert"
                options={cityOptions}
                inputSize="lg"
                rounded="md"
                defaultValue={roominginup ? city || "" : ""}
                {...register("city")}
                onChange={(e) => {
                  setValue("city", e.target?.value || "", {
                    shouldValidate: true,
                  });
                }}
                hasError={!!errors.city}
                errorMessage={errors.city?.message}
              />
            </div>
          )}
          {!roominginup && (
            <InputField
              tKeyHelpText={t("sector")}
              tKeyPlaceholder={t("sector")}
              placeholder="Sector o barrio"
              helpText="Sector o barrio"
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              defaultValue={roominginup ? neigborhood || "" : ""}
              {...register("neigborhood")}
              hasError={!!errors.neigborhood}
              errorMessage={errors.neigborhood?.message}
            />
          )}
          {!roominginup && (
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
              defaultValue={roominginup ? address || "" : ""}
              {...register("address")}
              hasError={!!errors.address}
              errorMessage={errors.address?.message}
            />
          )}
          <InputField
            className="mt-2"
            type="hidden"
            {...register("nameUnit")}
            hasError={!!errors.nameUnit}
            errorMessage={errors.nameUnit?.message}
          />
          <InputField type="hidden" {...register("conjunto_id")} />

          {statusup && (
            <InputField
              tKeyHelpText={t("unidadresidencial")}
              tKeyPlaceholder={t("unidadresidencial")}
              placeholder="Nombre de unidad residencial"
              helpText="Nombre de unidad residencial"
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("unitName")}
              hasError={!!errors.unitName}
              errorMessage={errors.unitName?.message}
            />
          )}
          {statusup && (
            <InputField
              tKeyHelpText={t("torre")}
              tKeyPlaceholder={t("torre")}
              placeholder="Torre o bloque"
              helpText="Torre"
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("tower")}
              hasError={!!errors.tower}
              errorMessage={errors.tower?.message}
            />
          )}
          {statusup && (
            <InputField
              placeholder="Número de apartamento o casa"
              helpText="Número de apartamento o casa"
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("apartment")}
              hasError={!!errors.apartment}
              errorMessage={errors.apartment?.message}
            />
          )}
          <div className="mt-2">
            <Controller
              name="amenities"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  tKeyHelpText={t("amenidades")}
                  tKeyDefaultOption={t("amenidades")}
                  id="amenities"
                  searchable
                  defaultOption="Amenidades"
                  helpText="Amenidades"
                  sizeHelp="sm"
                  options={amenitiesOptions}
                  inputSize="lg"
                  rounded="md"
                  disabled={false}
                  onChange={field.onChange} // RHF recibe el array string[]
                  hasError={!!errors.amenities}
                  errorMessage={errors.amenities?.message}
                />
              )}
            />
          </div>
          <div className="flex mt-2 mb-4 md:!mb-0 border rounded-md p-4">
            <div className="flex items-center justify-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("petsAllowed")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:bg-blue-600 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
              </label>
              <Text size="md" tKey={t("mascotas")} translate="yes">
                Active si aceptan mascotas
              </Text>
            </div>
            {errors.petsAllowed && (
              <Text size="sm" colVariant="danger">
                {errors.petsAllowed.message}
              </Text>
            )}
          </div>
          {!roominginup && (
            <div className="flex mt-2 mb-4 md:!mb-0 border rounded-md p-4">
              <div className="flex items-center justify-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("smokingAllowed")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:bg-blue-600 transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
                </label>
                <Text size="md" tKey={t("fumar")} translate="yes">
                  Active si permite fumar dentro del lugar
                </Text>
              </div>
              {errors.smokingAllowed && (
                <Text size="sm" colVariant="danger">
                  {errors.smokingAllowed.message}
                </Text>
              )}
            </div>
          )}
          {!roominginup && (
            <div className="flex mt-2 mb-4 md:!mb-0 border rounded-md p-4">
              <div className="flex items-center justify-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("eventsAllowed")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:bg-blue-600 transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
                </label>
                <Text size="md" tKey={t("eventos")} translate="yes">
                  Active si permite la realizacion de eventos
                </Text>
              </div>
              {errors.eventsAllowed && (
                <Text size="sm" colVariant="danger">
                  {errors.eventsAllowed.message}
                </Text>
              )}
            </div>
          )}
        </div>

        {/* Subida de imágenes */}
        <div className="w-full md:!w-[40%] border-x-4  h-[1000px]  p-2">
          <div className="w-full border-x-4 h-auto p-2 mt-6">
            <Text size="md" className="mb-2">
              Video de la propiedad (opcional)
            </Text>

            {/* Selección del tipo de video */}
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="videoType"
                  value="upload"
                  checked={videoType === "upload"}
                  onChange={() => setVideoType("upload")}
                />
                <Text size="sm">Subir video</Text>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="videoType"
                  value="youtube"
                  checked={videoType === "youtube"}
                  onChange={() => setVideoType("youtube")}
                />
                <Text size="sm">Enlace de YouTube</Text>
              </label>
            </div>

            {/* Subida de video */}
            {videoType === "upload" && (
              <>
                {watch("video") ? (
                  <div className="relative">
                    <video
                      src={URL.createObjectURL(watch("video"))}
                      controls
                      className="w-full h-auto rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setValue("video", null)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <IoClose size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="flex flex-col items-center justify-center h-[300px] cursor-pointer border-2 border-dashed border-gray-300 rounded-md hover:bg-gray-100 transition"
                  >
                    <Text size="sm" className="text-gray-400">
                      Haz clic para subir un video (.mp4, máx. 100 MB)
                    </Text>
                  </div>
                )}

                <input
                  type="file"
                  accept="video/mp4,video/mov,video/avi"
                  ref={videoInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setValue("video", file, { shouldValidate: true });
                    }
                  }}
                />

                {errors.video && (
                  <Text size="sm" colVariant="danger">
                    {errors.video.message}
                  </Text>
                )}
              </>
            )}

            {/* Enlace de YouTube */}
            {videoType === "youtube" && (
              <div>
                <InputField
                  placeholder="Enlace de video (YouTube, Vimeo, etc.)"
                  helpText="Pega el enlace de un video de la propiedad"
                  sizeHelp="sm"
                  inputSize="full"
                  rounded="md"
                  className="mt-2"
                  type="url"
                  {...register("videoUrl")}
                  hasError={!!errors.videoUrl}
                  errorMessage={errors.videoUrl?.message}
                />

                {watch("videoUrl")?.includes("youtube.com") && (
                  <iframe
                    className="w-full h-64 mt-2 rounded-md"
                    src={watch("videoUrl")!.replace("watch?v=", "embed/")}
                    allowFullScreen
                  />
                )}
              </div>
            )}
          </div>

          {previews.length === 0 ? (
            <>
              <IoImages
                onClick={handleIconClick}
                className="cursor-pointer text-gray-200 w-24 h-24 sm:w-48 sm:h-48 md:w-72 md:h-72 lg:w-[550px] lg:h-[550px]"
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
          ) : (
            <>
              <div className="max-h-[550px] overflow-y-auto space-y-4 pr-2 mt-2">
                {previews.map((src, index) => (
                  <div
                    key={index}
                    className="relative group w-full rounded-md overflow-hidden border border-gray-300"
                  >
                    {/* Número de imagen */}
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center z-10">
                      {index + 1}
                    </span>

                    {/* Botón eliminar */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
                    >
                      <IoClose size={14} />
                    </button>

                    <Image
                      src={src}
                      width={900}
                      height={350}
                      alt={`Vista previa ${index}`}
                      className="w-full h-auto rounded-md transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>

              {/* Controles inferiores */}
              <div className="flex mt-3 gap-4 items-center">
                <IoImages
                  size={50}
                  onClick={handleIconClick}
                  className="cursor-pointer text-gray-200"
                />
                <Text
                  size="sm"
                  className={`${
                    previews.length > 10 ? "text-red-500" : "text-gray-200"
                  }`}
                >
                  {`Has subido ${previews.length} ${
                    previews.length === 1 ? "imagen" : "imágenes"
                  } (máx. 10)`}
                </Text>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </>
          )}
        </div>

        {/* Lado derecho */}
        <div className="w-full md:!w-[30%]">
          <div className="flex mt-2 mb-4 md:!mb-0 border rounded-md p-4">
            <div className="flex items-center justify-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("residentplace")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:bg-blue-600 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
              </label>
              <Text size="md" tKey={t("exclusivo")} translate="yes">
                Activar si el lugar será exclusivo (No compartido). Ni con el
                anfitrion
              </Text>
            </div>
            {errors.residentplace && (
              <Text size="xs" colVariant="danger">
                {errors.residentplace.message}
              </Text>
            )}
          </div>
          <div className="flex mt-2 mb-4 md:!mb-0 border rounded-md p-4">
            <div className="flex items-center justify-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("bartroomPrivate")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:bg-blue-600 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
              </label>
              <Text size="md" tKey={t("banioPrivado")} translate="yes">
                Active si el alojamiento contara con baño privado
              </Text>
            </div>
            {errors.bartroomPrivate && (
              <Text size="sm" colVariant="danger">
                {errors.bartroomPrivate.message}
              </Text>
            )}
          </div>
          <div className="flex mt-2 mb-4 md:!mb-0 border rounded-md p-4">
            <div className="flex items-center justify-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("parking")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:bg-blue-600 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
              </label>
              <Text size="md">Active si ceunta con parqueadero</Text>
            </div>
            {errors.parking && (
              <Text size="sm" colVariant="danger">
                {errors.parking.message}
              </Text>
            )}
          </div>
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
            placeholder="Celular"
            helpText="Celular"
            sizeHelp="sm"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("cel")}
            hasError={!!errors.cel}
            errorMessage={errors.cel?.message}
          />
          <div className="mt-2">
            <SelectField
              searchable
              defaultOption="Moneda"
              helpText="Moneda"
              sizeHelp="sm"
              id="restroom"
              options={currencyOptions}
              inputSize="lg"
              rounded="md"
              {...register("currency")}
              hasError={!!errors.currency}
              errorMessage={errors.currency?.message}
            />
          </div>
          <InputField
            placeholder="Precio por noche"
            helpText="Precio por noche"
            sizeHelp="sm"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("price")}
            hasError={!!errors.price}
            errorMessage={errors.price?.message}
          />
          <InputField
            placeholder="Tarifa de limpieza"
            helpText="Tarifa de limpieza"
            sizeHelp="sm"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("cleaningFee")}
            hasError={!!errors.cleaningFee}
            errorMessage={errors.cleaningFee?.message}
          />
          <InputField
            placeholder="Deposito"
            helpText="Deposito"
            sizeHelp="sm"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("deposit")}
            hasError={!!errors.deposit}
            errorMessage={errors.deposit?.message}
          />

          <InputField
            placeholder="Cantidad maxima de huespedes"
            helpText="Cantidad maxima de huespedes"
            sizeHelp="sm"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("maxGuests")}
            hasError={!!errors.maxGuests}
            errorMessage={errors.maxGuests?.message}
          />

          <InputField
            tKeyHelpText={t("promocion")}
            tKeyPlaceholder={t("promocion")}
            placeholder="Promoción descuento"
            helpText="Promoción descuento"
            sizeHelp="sm"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="number"
            {...register("promotion")}
            hasError={!!errors.promotion}
            errorMessage={errors.promotion?.message}
          />

          <div className="mt-4 border p-2 rounded-md bg-gray-100">
            <Text size="md" tKey={t("seelccioneFecha")} translate="yes">
              Seleccione las fechas en que estara activo y a la vista para que
              la propiedad sea alquilada{" "}
            </Text>
            <div className="flex flex-col md:flex-row mt-2 gap-2">
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => {
                  setStartDate(date);
                  setValue(
                    "startDate",
                    date ? date.toISOString().split("T")[0] : ""
                  );
                }}
                minDate={new Date()}
                className="bg-gray-200 p-3 rounded-md"
                popperClassName="some-custom-class"
                popperPlacement="top-end"
                placeholderText={t("fechainicio")}
              />
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => {
                  setEndDate(date);
                  setValue(
                    "endDate",
                    date ? date.toISOString().split("T")[0] : ""
                  );
                }}
                minDate={startDate || new Date()}
                className="bg-gray-200 p-3 rounded-md"
                popperClassName="some-custom-class"
                popperPlacement="top-end"
                placeholderText={t("fechafin")}
              />
            </div>
          </div>
        </div>
      </section>
      <div className="mt-4 border p-2 rounded-md bg-gray-100">
        <Text
          size="md"
          font="bold"
          className="mt-2"
          tKey={t("habitacionescamas")}
          translate="yes"
        >
          Habitaciones y camas
        </Text>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="items-center flex gap-2 mb-2 border-b pb-2"
          >
            <div className="w-[50%]">
              <InputField
                placeholder={`Nombre habitación ${index + 1}`}
                tKeyHelpText={t("nombrehabitación")}
                tKeyPlaceholder={`${t("nombrehabitación")} ${index + 1}`}
                helpText="Nombre habitación"
                sizeHelp="sm"
                className="mt-2"
                inputSize="lg"
                rounded="md"
                type="text"
                {...register(`bedRooms.${index}.name`)}
              />
            </div>
            <div className="w-[50%]">
              <SelectField
                defaultOption="# camas"
                tKeyHelpText={t("camas")}
                helpText="Camas"
                sizeHelp="sm"
                id={`beds-${index}`}
                options={[1, 2, 3, 4, 5].map((b) => ({
                  value: String(b),
                  label: `${b} cama${b > 1 ? "s" : ""}`,
                }))}
                inputSize="lg"
                rounded="md"
                {...register(`bedRooms.${index}.beds`)}
                hasError={!!errors?.bedRooms?.[index]?.beds}
                errorMessage={
                  errors?.bedRooms?.[index]?.beds?.message as string
                }
              />
            </div>

            <Button
              type="button"
              size="sm"
              tKey={t("eliminar")}
              colVariant="danger"
              onClick={() => remove(index)}
            >
              Eliminar
            </Button>
          </div>
        ))}

        <Button
          type="button"
          size="sm"
          tKey={t("aniadir")}
          colVariant="primary"
          onClick={() =>
            append({ name: `Habitación ${fields.length + 1}`, beds: 1 })
          }
        >
          Añadir habitación
        </Button>
      </div>
      <textarea
        {...register("ruleshome")}
        className="bg-gray-200 w-full mt-2 p-4 rounded-md"
        placeholder={t("reglashogar")}
      />

      <textarea
        {...register("description")}
        className="bg-gray-200 w-full mt-2 p-4 rounded-md"
        placeholder={t("descripcionAtraer")}
      />

      <Button
        colVariant="warning"
        size="full"
        rounded="md"
        type="submit"
        className="mt-4"
        tKey={t("registerVacaltional")}
      >
        Registrar reserva vacacional
      </Button>
    </form>
  );
}
