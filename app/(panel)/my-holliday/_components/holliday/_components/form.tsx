"use client";
import {
  Button,
  InputField,
  MultiSelect,
  SelectField,
  Text,
  TextAreaField,
} from "complexes-next-components";
import React, { useEffect, useRef, useState } from "react";
import { IoClose, IoImages } from "react-icons/io5";

import Image from "next/image";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import { DateRange } from "react-date-range";
import { es } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import useForm from "./use-form";
import { useCountryCityOptions } from "@/app/(dashboard)/registers/_components/register-option";
import RegisterOptions from "./register-options";
import { Controller, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { FaCalendarAlt } from "react-icons/fa";

export default function Form() {
  const { PropertyOptions, amenitiesOptions } = RegisterOptions();

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState<
    { startDate: Date | null; endDate: Date | null; key: string }[]
  >([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  // ✅ Función segura para formatear fechas

  const calendarRef = useRef<HTMLDivElement | null>(null);

  // 🔸 Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        setShowCalendar(false);
      }
    }
    if (showCalendar)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-cyan-800 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
              </label>
              <Text size="sm" tKey={t("conjutos")} translate="yes">
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
            <div className="flex mt-2 my-4 md:!mb-0 border rounded-md p-4">
              <div className="flex items-center justify-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("status")}
                    onChange={(e) => setStatusup(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-cyan-800 transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
                </label>
                <Text size="sm" tKey={t("intoConjunto")} translate="yes">
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
                sizeHelp="xs"
                className="mt-2"
                id="property"
                options={PropertyOptions}
                inputSize="sm"
                rounded="lg"
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
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
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
                sizeHelp="xs"
                id="ofert"
                options={countryOptions}
                inputSize="sm"
                rounded="lg"
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
                sizeHelp="xs"
                id="ofert"
                options={cityOptions}
                inputSize="sm"
                rounded="lg"
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
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
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
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
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
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
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
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
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
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
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
                  sizeHelp="xs"
                  options={amenitiesOptions}
                  inputSize="sm"
                  rounded="lg"
                  disabled={false}
                  onChange={field.onChange}
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-cyan-800 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
              </label>
              <Text size="sm" tKey={t("mascotas")} translate="yes">
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-cyan-800 transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
                </label>
                <Text size="sm" tKey={t("fumar")} translate="yes">
                  Active si permite fumar dentro del lugar
                </Text>
              </div>
              {errors.smokingAllowed && (
                <Text size="xs" colVariant="danger">
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-cyan-800 transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
                </label>
                <Text size="sm" tKey={t("eventos")} translate="yes">
                  Active si permite la realizacion de eventos
                </Text>
              </div>
              {errors.eventsAllowed && (
                <Text size="xs" colVariant="danger">
                  {errors.eventsAllowed.message}
                </Text>
              )}
            </div>
          )}
        </div>

        {/* Subida de imágenes */}
        <div className="w-full md:!w-[40%] border-x-4  h-auto  p-2">
          <div className="relative mt-4 border p-2 rounded-md">
            <Text size="sm" className="my-2" font="bold">
              Fechas en que estará activo y visible
            </Text>

            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className={`w-full border ${
                errors.startDate || errors.endDate
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-lg px-3 py-2 flex items-center justify-between text-sm hover:border-gray-400 transition`}
            >
              <span>
                {dateRange[0].startDate && dateRange[0].endDate
                  ? `${formatDate(dateRange[0].startDate)} → ${formatDate(
                      dateRange[0].endDate
                    )}`
                  : "Selecciona fecha de llegada y salida"}
              </span>
              <FaCalendarAlt className="text-gray-600" />
            </button>

            {showCalendar && (
              <div
                ref={calendarRef}
                className="absolute top-full left-0 mt-2 z-50 bg-white shadow-xl rounded-lg border p-3"
              >
                <DateRange
                  ranges={dateRange}
                  onChange={(item: {
                    selection: { startDate: Date; endDate: Date };
                  }) => {
                    const { startDate, endDate } = item.selection;

                    setDateRange([{ ...item.selection, key: "selection" }]);
                    setValue(
                      "startDate",
                      startDate ? startDate.toISOString().split("T")[0] : "",
                      { shouldValidate: true }
                    );
                    setValue(
                      "endDate",
                      endDate ? endDate.toISOString().split("T")[0] : "",
                      { shouldValidate: true }
                    );

                    // ✅ Solo cerrar si el rango está completo y no son la misma fecha
                    if (
                      startDate &&
                      endDate &&
                      startDate.getTime() !== endDate.getTime()
                    ) {
                      setTimeout(() => setShowCalendar(false), 300);
                    }
                  }}
                  moveRangeOnFirstSelection={false}
                  months={2}
                  direction="horizontal"
                  locale={es}
                  rangeColors={["#155e75"]}
                  minDate={new Date()}
                />
              </div>
            )}

            {dateRange[0].startDate && dateRange[0].endDate && (
              <div className="mt-3 text-center">
                <Text size="sm" className="font-medium text-gray-700">
                  {`Del ${dateRange[0].startDate.toLocaleDateString()} al ${dateRange[0].endDate.toLocaleDateString()}`}
                </Text>
              </div>
            )}

            {(errors.startDate || errors.endDate) && (
              <div className="mt-2 text-center">
                {errors.startDate && (
                  <p className="text-red-500 text-sm">
                    {errors.startDate.message?.toString()}
                  </p>
                )}
                {errors.endDate && (
                  <p className="text-red-500 text-sm">
                    {errors.endDate.message?.toString()}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="w-full border-x-4 h-auto p-2 mt-6">
            <Text size="sm" className="mb-2">
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
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="lg"
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
              <hr className="my-4" />
              <IoImages
                onClick={handleIconClick}
                className="cursor-pointer text-gray-200 w-24 h-24 sm:w-48 sm:h-48 md:w-60  md:h-60"
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-cyan-800 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
              </label>
              <Text size="sm" tKey={t("exclusivo")} translate="yes">
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-cyan-800 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
              </label>
              <Text size="sm" tKey={t("banioPrivado")} translate="yes">
                Active si el alojamiento contara con baño privado
              </Text>
            </div>
            {errors.bartroomPrivate && (
              <Text size="xs" colVariant="danger">
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-cyan-800 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
              </label>
              <Text size="sm">Active si ceunta con parqueadero</Text>
            </div>
            {errors.parking && (
              <Text size="xs" colVariant="danger">
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
            sizeHelp="xs"
            id="indicative"
            options={indicativeOptions}
            inputSize="sm"
            rounded="lg"
            {...register("indicative")}
            onChange={(e) => {
              setValue("indicative", e.target.value, { shouldValidate: true });
            }}
            tKeyError={t("idicativoRequerido")}
            hasError={!!errors.indicative}
            errorMessage={errors.indicative?.message}
          />
          <InputField
            placeholder="Celular"
            helpText="Celular"
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
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
              sizeHelp="xs"
              id="restroom"
              options={currencyOptions}
              inputSize="sm"
              rounded="lg"
              {...register("currency")}
              hasError={!!errors.currency}
              errorMessage={errors.currency?.message}
            />
          </div>
          <InputField
            placeholder="Precio por noche"
            helpText="Precio por noche"
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            className="mt-2"
            type="text"
            {...register("price")}
            hasError={!!errors.price}
            errorMessage={errors.price?.message}
          />
          <InputField
            placeholder="Tarifa de limpieza"
            helpText="Tarifa de limpieza"
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            className="mt-2"
            type="text"
            {...register("cleaningFee")}
            hasError={!!errors.cleaningFee}
            errorMessage={errors.cleaningFee?.message}
          />
          <InputField
            placeholder="Deposito"
            helpText="Deposito"
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            className="mt-2"
            type="text"
            {...register("deposit")}
            hasError={!!errors.deposit}
            errorMessage={errors.deposit?.message}
          />

          <InputField
            placeholder="Cantidad maxima de huespedes"
            helpText="Cantidad maxima de huespedes"
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
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
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            className="mt-2"
            type="number"
            {...register("promotion")}
            hasError={!!errors.promotion}
            errorMessage={errors.promotion?.message}
          />
        </div>
      </section>
      <div className="mt-4 border p-2 rounded-md bg-gray-100">
        <Text
          size="sm"
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
                sizeHelp="xs"
                className="mt-2"
                inputSize="sm"
                rounded="lg"
                type="text"
                {...register(`bedRooms.${index}.name`)}
              />
            </div>
            <div className="w-[50%]">
              <SelectField
                defaultOption="# camas"
                tKeyHelpText={t("camas")}
                helpText="Camas"
                sizeHelp="xs"
                id={`beds-${index}`}
                options={[1, 2, 3, 4, 5].map((b) => ({
                  value: String(b),
                  label: `${b} cama${b > 1 ? "s" : ""}`,
                }))}
                inputSize="sm"
                rounded="lg"
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
      <TextAreaField
        {...register("ruleshome")}
        placeholder={t("reglashogar")}
        className="bg-gray-200 mt-2"
        sizeHelp="xs"
      />

      <TextAreaField
        placeholder={t("descripcionAtraer")}
        className="bg-gray-200 mt-2"
        {...register("description")}
        sizeHelp="xs"
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
